import path from "path";
import fs from "fs";
import { promisify } from "util";
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);

// starting from here
const args = process.argv.slice(2);

const error = (error) => {
  console.log();
  console.error(`ERROR: ${error}`);
  process.exit(1);
};

const AvailableParams = [
  { cmd: "-m", desc: "-m <name of module>" },
  { cmd: "-c", desc: "-c <name of component>" },
];
const showAvailableParams = () => {
  for (let pram of AvailableParams) {
    console.log(pram.desc);
  }
};

if (args.length === 0) {
  error("Invalid Number of Arguments");
} else if (args.length === 1) {
  error("Name of component or module must be required");
}

const cmd = args[0];
if (
  !cmd.startsWith("-") ||
  !AvailableParams.find((availPram) => cmd === availPram.cmd)
) {
  console.log();
  console.log("Available Third Arguments are:");
  showAvailableParams();
  error("Third argument must start with '-'");
}

const srcDirPath = path.join(process.cwd(), "src");

const jsFileCode = `import React from 'react'
import styles from './${args[1]}.module.scss';

const ${args[1]} = () => {
    return (
        <div className={styles.container}>${args[1]}</div>
    )
}

export default ${args[1]};`;

const scssFileCode = `@import "../../styles";

.container {
}`;

const appendText = `export {default as ${args[1]}} from './${args[1]}/${args[1]}';
`;

const createFolderAndFile = async (folderName) => {
  try {
    const folderPath = path.join(srcDirPath, folderName, args[1]);
    await mkdir(folderPath);
    await writeFile(path.join(folderPath, `${args[1]}.jsx`), jsFileCode);
    await writeFile(
      path.join(folderPath, `${args[1]}.module.scss`),
      scssFileCode
    );
    console.log(`Folder and files created successfully at ${folderPath}`);
  } catch (err) {
    if (err && err.code !== "EEXIST") {
      error(`Failed to create folder: ${err}`);
    } else if (err && err.code === "EEXIST") {
      error(`Folder already exist with name ${args[1]}`);
    } else {
      error(`Something went wrong: ${err}`);
    }
  }
};

const appendToIndex = async (folderName) => {
  try {
    const filePath = path.join(srcDirPath, folderName, "index.js");
    await appendFile(filePath, appendText);
  } catch (err) {
    error("Failed to append to file:", err);
  }
};

if (cmd === "-m") {
  createFolderAndFile("modules");
  appendToIndex("modules");
} else if (cmd === "-c") {
  createFolderAndFile("components");
  appendToIndex("components");
} else {
  error("Something went wrong!");
}
