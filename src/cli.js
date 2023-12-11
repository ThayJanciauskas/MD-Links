#!/usr/bin/env	node

const { mdLinks } = require('./index.js');
const chalk = require('chalk');

const filePath = process.argv[2];
const options = {
    validate: process.argv.includes('--validate'),
    stats: process.argv.includes('--stats'),
  };

mdLinks(filePath, options).then((objLinks) => {
  if (options.validate && !options.stats) {
    objLinks.forEach((link) => {
      if (link.status === 200) {
        console.log(

          chalk.bgGreen(('☑ OK ') + chalk.white(link.status)),
          (chalk.black('| ') + chalk.bgBlack(link.text)),
          chalk.blue(link.url),
        );
      } else {
        console.log(
          chalk.bgRed(('☒ FAIL ') + chalk.white(link.status)),
          (chalk.black('| ') + chalk.bgBlack(link.text)),
          // chalk.yellow(link.file),
          chalk.red(link.url),
        );
      }
      console.log(chalk.blackBright('---------------------------------------------------------------------------------------------'));
    });
  } else if (options.stats && !options.validate) {
    console.log(chalk.bgCyan('Total:') + ' '  + chalk.black(objLinks.total) + (' |'),
    (chalk.bgYellow('Unique:') + ' ' + chalk.black(objLinks.unique)));
  } else if (options.stats && options.validate) {
    console.log(chalk.bgCyan('Total:') + ' '  + chalk.black(objLinks.total) + (' |'),
    (chalk.bgYellow('Unique:') + ' ' + chalk.black(objLinks.unique)) + (' |'),
    (chalk.bgRed('Broken:') + ' ' + chalk.black(objLinks.broken)));
  } else {
    objLinks.forEach((link) => {
      console.log(chalk.white('Title: ') +  chalk.yellow(link.text));
      console.log(chalk.white('URL: ') + chalk.blue(link.url));
      console.log(chalk.white('File: ') + chalk.bgBlack(link.file));
      console.log(chalk.blackBright('---------------------------------------------------------'));
    });
  }
}).catch((error) => {
  if (error.message === 'Unable to read the file because it is empty') {
    console.log(chalk.red('Unable to read the file because it is empty'));
  } else if (error.message === 'Incompatible file: not a Markdown file') {
    console.log(chalk.red('Incompatible file: not a Markdown file'));
  } else if (error.message === 'No links found in this file') {
    console.log(chalk.red('No links found in this file'));
  } else if (error.message === 'File/directory not found'){
    console.log(chalk.red('File/directory not found'));
  }else {
    console.log(chalk.red('Invalid command'));
  }
});
