import Logger from '../../shared/infra/rabbit/logger';

const mockLoggerFile = jest.fn();
jest.mock('./../shared/infra/rabbit/logger', () => {
    return jest.fn().mockImplementation(() => {
        return { Logger: mockLoggerFile };
    });
});
