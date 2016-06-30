# Focus Redux

## Why ?

- In focus components we provide a form which even if it was separated in sevral mixin, was really to use as a stand alone component.
- We also found that there was state related issue inside many components, some from focus, some from the one built inside the projects.
- We also want users to be able to have a better understanding of whats is going on, which actions are triggered, how is the state build.
- We want you to have better devtools to use focus, to have a great Developer Experience.

## What is under the hood

- As in each focus extension, we use a tiny library to  manage the application state called redux.
- Previously we use to have a dispatcher from `flux` library and build state over `EventEmitter`
- Now your state is build with functions and can be build with as many nodes as you need in structure like complex json object.

> You need to read the awesome [Redux](http://redux.js.org/) documentation. At least the concepts.

## Previous concepts

A component `Component = f(state, props)`


## Concepts

## Flow types

We choose to use flowtype notation (as a test for now) in order to provide efficient signature to everyone who use the lib.
We don't want to add typing across the whole library but on all public entry points.
Both flow and typscript share a similiar way of declaring types but as typscript is quite all or nothing, we use flow.

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




## What we rely on

We try to use two concepts
- Providers :A Provider component will provide (as its name says it) informations to all its children via something called the `context`. (We do not encourage you to write any informations in the context by your own). Use the `Providers` instead.
- Connectors: When we use a provider inside a component hierarchy, we try to use a connector to access its information.

## Example

If I have an application
```jsx
import React from 'react';
import {Provider as DomainProvider} from 'focus-redux/behaviours/domain';
import myDomains from './my-app-domains';
const MyApp = props => {
  return <DomainProvider domains={myDomains}>
    <Layout>
          <MyChildComponentWhoNeedsInformationsFromTheDomain name='great tutorial'/>
    </Layout>
  </DomainProvider>
};
```

Where
```jsx
const MyChildComponentWhoNeedsInformationsFromTheDomain = props => {
  return <div>Hello props.domain.TEXT.formatter(props.name)</div>
}
export default connectToDomains(MyChildComponentWhoNeedsInformationsFromTheDomain);
```

## Explainations

Provider(informationsToPassToTheComponentsTree) => Tree => connectToInformations(Child) => The child gets this information in its props.


// todo:

- [] Check the Provider chain presence (form needs metadata)
