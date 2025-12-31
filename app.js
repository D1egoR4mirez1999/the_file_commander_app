const fs = require("fs/promises");
const { Buffer } = require("buffer");

(async () => {
  // FUNCTIONS
  const createFile = async (path) => {
    console.log(`creating the file ${path}`);

    try {
      const existingFileHandler = await fs.open(path, "wx");
      existingFileHandler.close();

      console.log(`the file was created successfully`);
    } catch (error) {
      if (error.code === "EEXIST") {
        console.log("file already exist");
      } else {
        console.log("something went wrong while creating the file");
      }
    }
  };

  const deleteFile = async (path) => {
    console.log(`deleting the file ${path}`);

    try {
      await fs.unlink(path);
      console.log(`the file was removed successfully`);
    } catch (error) {
      if (error.code === "ENOUNT") {
        console.log(`the file ${path} does not exist.`);
      } else {
        console.log("something went wrong while deleting the file ");
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    console.log("renaming the file...");

    try {
      await fs.rename(oldPath, newPath);
      console.log(`file was renamed successfully`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`the file does not exist.`);
      } else {
        console.log("something went wrong while renaming the file ");
      }
    }
  };

  let addedContent;
  const addToFile = async (path, content) => {
    console.log("adding to the file...");

    if (addedContent === content) {
      console.log("same content to add");
      return;
    }

    addedContent = content;
    try {
      const existingFileHandler = await fs.open(path);
      existingFileHandler.close();

      const fileHandler = await fs.open(path, "a");
      await fileHandler.write(content);
      fileHandler.close();

      console.log(`content added successfully`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`the file does not exist`);
      } else {
        console.log(
          "something went wrong while adding the content to the file"
        );
      }
    }
  };

  // COMMANDS
  const CREATE_FILE = "create the file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const fileHandler = await fs.open("./command.txt", "r");
  const watcher = fs.watch("./command.txt");

  // Listener
  fileHandler.on("change", async () => {
    const fileHandlerStats = await fileHandler.stat();

    const buff = Buffer.alloc(fileHandlerStats.size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await fileHandler.read(buff, offset, length, position);

    const command = buff.toString();

    // Creating a file
    if (command.includes(CREATE_FILE)) {
      const path = command.substring(CREATE_FILE.length + 1).trim();
      await createFile(path);
    }

    // Deleting a file
    if (command.includes(DELETE_FILE)) {
      const path = command.substring(DELETE_FILE.length + 1).trim();
      await deleteFile(path);
    }

    // renaming a file
    // rename the file <old-path> to <new-path>
    if (command.includes(RENAME_FILE)) {
      const match = command.match(/^rename the file (.+?) to (.+)$/);
      if (match) {
        const oldPath = match[1].trim();
        const newPath = match[2].trim();
        renameFile(oldPath, newPath);
      } else {
        console.log("Invalid rename command format");
      }
    }

    // adding content to a file
    // add to the file <path> this content <example>
    if (command.includes(ADD_TO_FILE)) {
      const match = command.match(/^add to the file (.+?) this content: (.+)$/);
      if (match) {
        const path = match[1].trim();
        const content = match[2].trim();
        addToFile(path, content);
      } else {
        console.log("Invalid add to file command format");
      }
    }
  });

  for await (const event of watcher) {
    if (event.eventType === "change") {
      fileHandler.emit("change");
    }
  }
})();
