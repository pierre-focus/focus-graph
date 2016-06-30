// @flow
import React, {Component, PropTypes} from 'react';
import {connect as connectToStore} from './store';
import {createForm, destroyForm, toggleFormEditing, validateForm, syncFormEntities} from '../actions/form';
import {inputChange, inputBlur, inputBlurList} from '../actions/input';
import find from 'lodash/find';
import compose from 'lodash/flowRight';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';

// Validate the options given to the form.
// formkey is the name of the form
// entityPathArray is all the entities you want to read the metadata from.
const validateFormOptions = ({formKey, entityPathArray}) => {
    if (!isString(formKey)) throw new Error('FormConnect: You must provide a "formKey" option as a string to the form connect.');
    if (!isArray(entityPathArray)) throw new Error('FormConnect: You must provide a "entityPathArray" option as an array to the form connect.');
}

// Select the form part of the state in the redux store.
// This will be the default argument pass to redux connect.
const internalMapStateToProps = (state, formKey) => {
    // selector on the form state
    const formCandidate = find(state.forms, {formKey});
    const resultingProps = {...formCandidate};
    if (resultingProps) resultingProps.getUserInput = () => formCandidate.fields.reduce((entities, field) => ({...entities, [field.entityPath]: {...entities[field.entityPath], [field.name]: field.rawInputValue}}), {})
    return resultingProps;
};

// Wrap with the dispatch method all the 'common' actions linked to the form.
// This will be provide by default to to the redux connect dispatch.
const internalMapDispatchToProps = (dispatch, loadAction, saveAction, formKey, nonValidatedFields) => {
    const resultingActions = {};
    if (loadAction) resultingActions.load = (...loadArgs) => dispatch(loadAction(...loadArgs));
    if (saveAction) resultingActions.save = (...saveArgs) => dispatch(validateForm(formKey, nonValidatedFields, saveAction(...saveArgs)));
    return resultingActions;
};

/**
 * Extends the provided component
 * Creates and destroys the form, binds the inputChange methods to the current form key
 * @param  {ReactComponent} ComponentToConnect  the component that will be extended
 * @param  {object} formOptions                 the form options
 * @return {ReactComponent}                     the extended component
 */
const getExtendedComponent = (ComponentToConnect: ReactClass<{}>, formOptions: FormOptions) => {
    class FormComponent extends Component {
        componentWillMount() {
            const {store: {dispatch}} = this.context;
            // On component mounting, create the form in the Redux state
            dispatch(createForm(formOptions.formKey, formOptions.entityPathArray));
        }

        componentWillUnmount() {
            const {store: {dispatch}} = this.context;
            // On component mounting, remove the form from the Redux state
            dispatch(destroyForm(formOptions.formKey));
        }

        _onInputChange(name, entityPath, value) {
            const {store: {dispatch}} = this.context;
            dispatch(inputChange(formOptions.formKey, name, entityPath, value));
        }
        _onInputBlurList(name, entityPath, value, propertyNameLine, index){
          const {store: {dispatch}} = this.context;
          dispatch(inputBlurList(formOptions.formKey, name, entityPath, value, propertyNameLine, index));
        }

        _onInputBlur(name, entityPath, value) {
            const {store: {dispatch}} = this.context;
            dispatch(inputBlur(formOptions.formKey, name, entityPath, value));
        }

        _toggleEdit(edit) {
            // Read the dispatch inside the context to avoid a connect
            const {store: {dispatch}} = this.context;
            if (!edit) {
                // Edit is set to false, this means the user cancelled the edition, so dispatch a syncFormEntities action
                dispatch(syncFormEntities(formOptions.formKey));
            }
            dispatch(toggleFormEditing(formOptions.formKey, edit));
        }

        render() {
            const {_behaviours, ...otherProps} = this.props;
            // Notifiy the coomponent that we extend the behaviour.
            const behaviours = {connectedToForm: true, ..._behaviours};
            return <ComponentToConnect {...otherProps} _behaviours={behaviours} onInputChange={::this._onInputChange} onInputBlur={::this._onInputBlur} onInputBlurList={::this._onInputBlurList} toggleEdit={::this._toggleEdit} entityPathArray={formOptions.entityPathArray} />;
        }
    }
    // Extract the redux methods without a connector to avoid a function wrapping.
    FormComponent.contextTypes = {
        store: PropTypes.shape({
            subscribe: PropTypes.func.isRequired,
            dispatch: PropTypes.func.isRequired,
            getState: PropTypes.func.isRequired
        })
    };
    return FormComponent;
};

// This uses Flowtype notation.
// Our goal here is to provide usefull signature and informations
// FormOptions will be used by the form connector
type FormOptions = {
  // the form key will be used to name the associated state node in the form.
  formKey: string,
  // an array of all the entity paths the form should listen to. An entity path is the path in the dataset to reach the entity
  entityPathArray:  Array<string>,
  // a function taking the redux state as an argument and returning the props that should be given to the form component
  mapStateToProps: Function,
  // a function taking the redux dispatch function as an argument and returning the props that should be given to the form component
  mapDispatchToProps: Function,
  // the entity load action. If provided, a 'load' function will be provided as a prop, automatically dispatching the loadAction output
  loadAction: Function,
  // same as loadAction but with the save
  saveAction: Function,
  // The array of fields you don't want to validate.
  nonValidatedFields: Array<string>
}

/**
 * Form connector
 * Wraps the provided component into a component that will create the form on mounting and destroy it on unmounting.
 * Exposes an onInputChange prop already filled with the form key
 * FormOptions is describe in the associated type
 * Usage: const FormComponent = connect({formKey: 'movieForm', entityPathArray: ['movie']})(MyComponent);
 */
export const connect = (formOptions: FormOptions) => (ComponentToConnect: ReactClass<{}>) => {
    const {
        formKey,
        entityPathArray,
        mapStateToProps: userDefinedMapStateToProps = () => ({}),
        mapDispatchToProps: userDefinedMapDispatchToProps = () => ({}),
        loadAction,
        saveAction,
        nonValidatedFields
    } = formOptions;

    // Validate the provided options

    validateFormOptions(formOptions);

    // Extend the component
    const extendedComponent = getExtendedComponent(ComponentToConnect, formOptions);

    const mapStateToProps : Function = state => ({
        ...internalMapStateToProps(state, formKey),
        ...userDefinedMapStateToProps(state)
    });
    const mapDispatchToProps : Function = (dispatch: Function) => ({
        ...internalMapDispatchToProps(dispatch, loadAction, saveAction, formKey, nonValidatedFields),
        ...userDefinedMapDispatchToProps(dispatch)
    });

    // Call the redux connector
    return connectToStore(entityPathArray, {
        mapStateToProps,
        mapDispatchToProps}
    )(extendedComponent);
}
