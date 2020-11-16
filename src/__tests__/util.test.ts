import { User } from '../types';
import * as util from '../util';

describe('utils', () => {
  describe('the getFile function', () => {
    it('should return an object if given valid filename', () => {
      const file = util.getFile('lists.json');
      expect(file).toBeInstanceOf(Object);
    });

    it('should throw an error if given invalid filename', () => {
      expect(() => {
        util.getFile('blah.txt');
      }).toThrowError();
    });
  });

  describe('the writeFile function', () => {
    it('should write a string to a given file', () => {
      const data = { text: 'testing' };
      util.writeFile('users.test.json', JSON.stringify(data));
      const file = util.getFile('users.test.json');
      expect(file).toStrictEqual(data);
    });
  });

  describe('the getInitials function', () => {
    it('should return the iniitals of a passed in name', () => {
      expect(util.getInitials('Måns Jackson')).toEqual('MJ');
    });

    it('should return the first two letters if only given 1 name', () => {
      expect(util.getInitials('Måns')).toEqual('Må');
    });
  });

  describe('the isValidEmail function', () => {
    it('should return true if given a valid email address', () => {
      expect(util.isValidEmail('test@test.com')).toEqual(true);
    });

    it('should return false if given an invalid email address', () => {
      expect(util.isValidEmail('test@test@com')).toEqual(false);
    });
  });

  describe('the is valid user function', () => {
    const user: User & { passwordConf: string } = {
      id: 'askjdhgasdoiuagskljdhbasodiuyg',
      name: 'Måns',
      email: 'test@test.com',
      password: 'supersecret',
      passwordConf: 'supersecret',
      shared: [],
    };
    it('should return true if a valid user object is passed in', () => {
      expect(util.isValidUser(user)).toEqual(true);
    });
    it('should return false if passwords do not match', () => {
      expect(util.isValidUser({ ...user, passwordConf: 's3cret' })).toEqual(false);
    });
    it('should return false if password is too short', () => {
      expect(util.isValidUser({ ...user, password: 's3cret' })).toEqual(false);
    });
    it('should return false if email is invalid', () => {
      expect(util.isValidUser({ ...user, email: 'hejsan.com' })).toEqual(false);
    });
  });

  describe('the email exists function', () => {
    it('should return false if an email is available', () => {
      expect(util.emailExists('unique@unique.com')).toEqual(false);
    });
  });
});
