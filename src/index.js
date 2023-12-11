const fs = require('fs');
const path = require('path');

function mdLinks(filePath, options) {
  const absolutePath = path.resolve(filePath);
    return fs.promises.readFile(filePath, 'utf8').then ((fileContent) => {
      if (path.extname(absolutePath).toLowerCase() !== '.md') {
        throw new Error('Incompatible file: not a Markdown file');
      } else if (!fileContent) {
        throw new Error('Unable to read the file because it is empty');
      }
      const pattern = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      const matches = [...fileContent.matchAll(pattern)];
      const objLinks = matches.map((link) => ({
        text: link[1],
        url: link[2],
        file: filePath,
      }));
      if (objLinks.length === 0) {
        throw new Error('No links found in this file');
      }
      if(options.validate || options.stats){
      const validations = objLinks.map((link) =>
          validateLink(link)
        )
      if(options.validate && !options.stats){
        return Promise.all(validations);
      }else{
       return Promise.all(validations).then((validateArray)=> 
       statsLink(validateArray, options));
      }
    }
      return objLinks;
    }).catch((error) => {
      if (error.code === 'ENOENT') {
        throw new Error('File/directory not found');
      }
      throw error;
    });
}  

function validateLink(link) {
  return fetch(link.url)
  .then(response => {
    if (response.ok) {
      link.valid = true;
      link.status = response.status;
    } else {
      link.valid = false;
      link.status = response.status;
    }
    return link;
  })
  .catch(error => {
    link.valid = false;
    link.error = error.message;
    return link;
  });
}

function statsLink(links) {
  const totalLinks = links.length;
  const uniqueLinks = [...new Set(links.map((link) => link.url))].length;
  const brokenLinks = links.filter((link) => link.status !== 200).length;
  return {
    total: totalLinks,
    unique: uniqueLinks,
    broken: brokenLinks,
  };
}

module.exports = { mdLinks, validateLink, statsLink };