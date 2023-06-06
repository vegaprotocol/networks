require("isomorphic-fetch");
const fs = require("fs");

const EXPLORER_URLS = {
  mainnet1: 'https://explorer.vega.xyz/',
  testnet1: 'https://explorer.fairground.wtf/',
  testnet2: 'https://explorer.validators-testnet.vega.rocks/',
}

const run = async () => {
  try {
    // Get contents of the repo
    const res = await fetch(
      "https://api.github.com/repos/vegaprotocol/networks/contents"
    );
    const networkDirs = await res.json();

    if (!Array.isArray(networkDirs)) {
      throw new Error("Expected networks repo to be an array");
    }

    // Filter, keeping only directories that dont start with '.'
    const networks = networkDirs.filter((content) => {
      if (content.type !== "dir") return false;
      if (content.name.startsWith(".")) return false;
      return true;
    });

    // Get contents of each subdirectory
    const networksContents = await Promise.all(
      networks.map(async (content) => {
        const res = await fetch(content.url);
        return res.json();
      })
    );

    // Reduce each directory into a NetworkOption with name and raw download link
    const configFiles = networksContents.reduce((arr, networkContent, i) => {
      const network = networks[i];

      if (Array.isArray(networkContent)) {
        const configFile = networkContent.find(
          (item) => item.name === `${network.name}.toml`
        );

        if (configFile?.download_url) {
          arr.push({
            name: network.name,
            configFileUrl: configFile.download_url,
            explorer: EXPLORER_URLS[network.name] || '',
            sha: configFile.sha,
          });
        } else {
          console.log(`No .toml file found for network: ${network.name}`);
        }
      } else {
        throw new Error("Network repo content is not an array");
      }

      return arr;
    }, []);

    fs.writeFileSync(
      "../networks.json",
      JSON.stringify(configFiles, null, "  "),
      {
        encoding: "UTF-8",
      }
    );
  } catch (err) {
    console.log(err);
  }
};

run();
