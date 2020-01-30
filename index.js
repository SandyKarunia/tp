#!/usr/bin/env node

const configLib = require("./lib/config");

const printHelp = () => {
  const text =
    "Configuration file location: " +
    configLib.getConfigFileLocation() +
    "\n" +
    "Commands:\n" +
    "tp <location> - Go to the saved location\n" +
    "tp --list - Show list of saved locations\n" +
    "tp --save <location> - Save current directory as <location>\n" +
    "tp --remove - Remove <location>\n";

  console.log(text);
};

const listLocations = async () => {
  const configObj = await configLib.readConfig();
  let text = "Saved locations:\n";
  for (const key in configObj) {
    if (configObj.hasOwnProperty(key)) {
      text += "- " + key + " ==> " + configObj[key] + "\n";
    }
  }

  console.log(text);
};

const saveNewLocation = async params => {
  if (params.length < 1) {
    printHelp();
    return;
  }

  const locationName = params[0];
  const configObj = configLib.readConfig();
  configObj[locationName] = process.cwd();

  await configLib.writeConfig(configObj);
  console.log("Saved " + locationName + " ==> " + configObj[locationName]);
};

const removeLocation = async params => {
  if (params.length < 1) {
    printHelp();
    return;
  }

  const locationName = params[0];
  const configObj = configLib.readConfig();
  delete configObj[locationName];

  await configLib.writeConfig(configObj);
  console.log("Removed " + locationName);
};

const run = async () => {
  const args = process.argv;

  // get the command starting with --
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const cmd = args[i].substring(2);
      const params = args.slice(i + 1);

      switch (cmd) {
        case "save":
          await saveNewLocation(params);
          break;
        case "remove":
          await removeLocation(params);
          break;
        case "list":
          await listLocations();
          break;
        default:
          printHelp();
      }

      return;
    }
  }

  // no command starting with --, get the last one and look up the config file
  const config = configLib.readConfig();
  const target = args[args.length - 1];
  if (config.hasOwnProperty(target)) {
    const targetPath = config[target];
    // move to the target path
    process.chdir(targetPath);
    return;
  }

  // location not found
  console.log(
    "Location '" +
      target +
      "' not found! See all saved locations by using --list"
  );
};

run();
