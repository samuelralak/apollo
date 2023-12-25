# Apollo

## Problem: We lack a community-driven Q&A platform for knowledge sharing. 

While building Nostrosity for the NOSTR network, we identified a gap in community interaction and knowledge sharing. The platform (and NOSTR in general) lacks an integrated space for users to ask and answer questions, hindering the full potential of collaborative learning and problem-solving.

### Solution

We are building Apollo to address the need for a structured, user-driven Q&A mechanism within NOSTR. It is aimed at enabling users to exchange knowledge, aiding in community learning, and facilitating problem-solving in a collaborative manner.

Apollo integrates into the larger vision of Nostrosity, enhancing its role as a comprehensive tool on the NOSTR network. It enriches the platform by fostering a community-centric space for queries, discussions, and shared learning.

### Why Apollo?

Named after the Greek deity symbolizing knowledge and enlightenment, Apollo is a Q&A platform built on NOSTR. It serves as a hub for knowledge sharing, where questions find enlightenment through community-driven answers. This platform is being built to support a vibrant exchange of ideas and solutions, fostering learning and collaboration within the NOSTR community.

## What is Nostrosity? 

Nostrosity is a project aimed at enhancing the NOSTR network experience by providing features like a verified NIP05 identifier, a Lightning wallet, and a centralized management system for NOSTR keys and profiles. It's designed to simplify and enrich user interaction within the decentralized NOSTR network. More about Nostrosity and its motivations can be found on its Nostrocket [here](https://nostrocket.org/problems/d6510cbadbf2650ac4a3f383761b435dda2cb37c283f815529a981a4885e45b6) and website [here](https://web.nostrosity.com).

## Project setup

This repository hosts a React TypeScript project, set up with Vite. Follow these steps to get the project up and running.

1. Clone this repository and navigate to the project directory

    ```shell
    $ git clone git@github.com:samuelralak/apollo.git && cd apollo/
    ```
2. Install dependencies and run the development server

    ```shell
    $ yarn install && yarn dev
    ```

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
