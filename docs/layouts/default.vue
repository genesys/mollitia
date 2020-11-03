<template>
  <div id="app">
    <Nuxt />
  </div>
</template>

<style lang="scss">
html {
  font-family: 'Roboto';
  background-color: var(--madoc-github-grey-6);
  color: var(--madoc-white);
  height: 100%;
  overflow-x: hidden;
}
body {
  height: 100%;
  margin: 0;
  > div#__nuxt {
    height: 100%;
    > div#__layout {
      height: 100%;
      > div#app {
        height: 100%;
        > div.madoc-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          > div.madoc-container {
            flex-grow: 1;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            > div.madoc-wrapper {
              flex-grow: 1;
              overflow: auto;
              > div.madoc-content {
                margin: 0 auto 50px auto;
                max-width: 60%;
                min-width: 800px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
