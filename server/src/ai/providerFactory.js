const openRouterProvider = require('./openRouterProvider');
const geminiProvider = require('./geminiProvider');

class ProviderFactory {
  getProvider() {
    if (openRouterProvider.isAvailable()) {
      return openRouterProvider;
    }
    if (geminiProvider.isAvailable()) {
      return geminiProvider;
    }
    return null;
  }

  hasAvailableProvider() {
    return Boolean(openRouterProvider.isAvailable() || geminiProvider.isAvailable());
  }
}

module.exports = new ProviderFactory();
