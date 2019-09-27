import generateFeeds from './generateFeeds'

export default pluginOptions => ({
  afterExport: async () => {
    await generateFeeds();
  }
});
