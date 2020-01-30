const path = require("path");
const fs = require("fs");
const readline = require("readline");
const events = require("events");
const userHomeDirectory = require("os").homedir();
const configFilePath = path.join(userHomeDirectory, ".tpcfg");
const configSeparator = "==>";

const writeConfigFile = configObj => {
  const header = "// Configuration file for github.com/SandyKarunia/tp CLI\n\n";
  let content = "";

  // iterate through all keys and values
  for (const key in configObj || {}) {
    if (configObj.hasOwnProperty(key)) {
      const val = configObj[key];
      content += key + " " + configSeparator + " " + val + "\n";
    }
  }

  fs.writeFileSync(configFilePath, header + content);
};

/**
 * Initializes the config file.
 */
const initConfigFile = () => {
  writeConfigFile({});
  console.log("Initialized config file in " + configFilePath);
};

/**
 * Parses the config file. The alias / destination in the configuration file is separated by "==>" token.
 * For example: "myproject ==> D:/data/projects"
 *
 * @return a configuration object with key as an alias, and value as the destination
 */
const parseConfigFile = async () => {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(configFilePath),
    crlfDelay: Infinity
  });

  const result = {};

  // read line by line asynchronously
  readInterface.on("line", line => {
    // ignore if the line starts with "//"
    if (line.trim().startsWith("//")) {
      return;
    }

    // split the line with "==>" token
    const lineSplit = line.split(configSeparator);
    if (lineSplit.length < 2) {
      return;
    }
    result[lineSplit[0].trim()] = lineSplit[1].trim();
  });

  // wait until the whole file is read
  await events.once(readInterface, "close");

  return result;
};

module.exports = {
  /**
   * Gets the configuration object from configuration file.
   *
   * If the configuration file doesn't exist, create a new one with empty configuration.
   */
  readConfig: async () => {
    // if it doesn't exist, create a new config file
    if (!fs.existsSync(configFilePath)) {
      initConfigFile();
    }

    return parseConfigFile();
  },

  /**
   * Writes the configuration object into configuration file.
   */
  writeConfig: async configObj => {
    writeConfigFile(configObj);
  },

  getConfigFileLocation: () => {
    return configFilePath;
  }
};
