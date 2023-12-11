import { mdLinks, validateLink, statsLink } from '../src/index.js';

describe('mdLinks function tests', () => {
  it('must return links from a markdown file', () => {
    const filePath = './files/test.md';
    const options = {};
    return mdLinks(filePath, options).then((result) => {
      expect(result).toEqual([
        {
          text: 'GitHub',
          url: 'https://github.com/ThayJanciauskas',
          file: filePath,
        },
        {
          text: 'Linkedin',
          url: 'https://www.linkedin.com/feed/',
          file: filePath,
        },
        {
          text: 'Mozilla',
          url: 'https://developer.mozilla.org/pt-BR/',
          file: filePath,
        },
        {
          text: 'Link Inexistente',
          url: 'https://www.laboratoria.la/thay',
          file: filePath,
        },
      ]);
    });
  });

  it('should reject if file/directory does not exist', () => {
    const fakeFile = 'arquivoinexistente.md';
    return expect(mdLinks(fakeFile)).rejects.toThrow('File/directory not found');
  });

  it('should reject file other than md', () => {
    const fakeMdFile = './files/text.txt';
    return expect(mdLinks(fakeMdFile)).rejects.toThrow('Incompatible file: not a Markdown file');
  });

  it('should reject the file if it is empty', () => {
    const emptyFile = './files/empty.md';
    return expect(mdLinks(emptyFile)).rejects.toThrow('Unable to read the file because it is empty');
  });
  
  it('should return an empty array if there are no links in the Markdown file', () => {
    const filePath = './files/nolinks.md';
    return expect(mdLinks(filePath)).rejects.toThrow('No links found in this file');
  
  });

  it('should return all link validations if the validation option is enabled', () => {
    const filePath = './files/test.md';
    const options = { validate: true, stats: false };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual( [
            {
             "file": "./files/test.md",
             "status": 200,
             "text": 'GitHub',
             "url": 'https://github.com/ThayJanciauskas',
             "valid": true,
           },
            {
             "file": "./files/test.md",
             "status": 200,
             "text": "Linkedin",
             "url": "https://www.linkedin.com/feed/",
             "valid": true,
           },
            {
             "file": "./files/test.md",
             "status": 200,
             "text": "Mozilla",
             "url": "https://developer.mozilla.org/pt-BR/",
             "valid": true,
           },
            {
             "file": "./files/test.md",
             "status": 200,
             "text": "Link Inexistente",
             "url": "https://www.laboratoria.la/thay",
             "valid": true,
           },
            
         ])
    });
  });
  it('should return link statistics if the statistics option is enabled', () => {
    const filePath = './files/test.md';
    const options = { validate: true, stats: true };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual({"broken": 2,
       "total": 6, 
       "unique": 5})
    });
  });
  it('should return link statistics if the statistics option is enabled', () => {
    const filePath = './files/test.md';
    const options = { validate: false, stats: true };
    return mdLinks(filePath, options).then((result) => {
      expect(result).toStrictEqual({"broken": 2,
       "total": 6, 
       "unique": 5})
    });
  });
});


describe('validateLink', () => {
  it('is a function', () => {
    expect(typeof validateLink).toBe('function');
  });
  it('should validate the link correctly', () => {
    const link = {
      text: 'Linkedin',
      url: 'https://www.linkedin.com/feed/',
      file: './files/test.md',
    };

    const expectedValidLink = {
      text: 'Linkedin',
      url: 'https://www.linkedin.com/feed/',
      file: './files/test.md',
      valid: true, 
      status: 200, 
    };

    const mockedFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      })
    );

    global.fetch = mockedFetch;

    return validateLink(link).then((result) => {
      expect(result).toEqual(expectedValidLink);
    });
  });

  it('should handle error for an invalid link', () => {
    const link = {
      text: 'test 2',
      url: 'https://invalidurl.example.com',
      file: './files/test.md',
    };

    const expectedInvalidLink = {
      text: 'test 2',
      url: 'https://invalidurl.example.com',
      file: './files/test.md',
      valid: false, 
      error: 'Network error', 
    };

    const mockedFetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    global.fetch = mockedFetch;

    return validateLink(link).then((result) => {
      expect(result).toEqual(expectedInvalidLink);
    });
  });
});


describe('statsLink', () => {
  it('is a function', () => {
    expect(typeof statsLink).toBe('function');
  });
  it('should calculate the statistics correctly', () => {
    const links = [
      {
        text: 'Markdown',
        url: 'https://pt.wikipedia.org/wiki/Markdown',
        file: './files/test.md',
        status: 200,
      },
      {
        text: 'Node.js',
        url: 'https://nodejs.org/',
        file: './files/test.md',
        status: 200,
      },
      {
        text: 'Laboratoria',
        url: 'https://www.laboratoria.la/ana',
        file: './files/test.md',
        status: 400,
      },
      {
        text: 'Node.js',
        url: 'https://nodejs.org/',
        file: './files/test.md',
        status: 200,
      },
    ];

    const expectedResult = {
      total: 4,
      unique: 3,
      broken: 1,
    };

    const result = statsLink(links);
    expect(result).toEqual(expectedResult);
  });
});