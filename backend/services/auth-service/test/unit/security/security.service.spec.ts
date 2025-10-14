import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityService } from '../../../src/security/security.service';
import { SecurityEvent, SecurityEventType } from '../../../src/security/entities/security-event.entity';
import { TestFactories } from '../../utils/test-factories';

describe('SecurityService', () => {
  let securityService: SecurityService;
  let securityEventRepository: Repository<SecurityEvent>;

  // Mock repository
  const mockSecurityEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: getRepositoryToken(SecurityEvent),
          useValue: mockSecurityEventRepository,
        },
      ],
    }).compile();

    securityService = module.get<SecurityService>(SecurityService);
    securityEventRepository = module.get<Repository<SecurityEvent>>(
      getRepositoryToken(SecurityEvent),
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should successfully log a security event', async () => {
      // Arrange
      const logEventDto = {
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'device-123',
        description: 'User logged in successfully',
      };

      const savedEvent = TestFactories.createSecurityEvent(logEventDto);
      mockSecurityEventRepository.create.mockReturnValue(savedEvent);
      mockSecurityEventRepository.save.mockResolvedValue(savedEvent);

      // Act
      const result = await securityService.logEvent(logEventDto);

      // Assert
      expect(mockSecurityEventRepository.create).toHaveBeenCalledWith(logEventDto);
      expect(mockSecurityEventRepository.save).toHaveBeenCalledWith(savedEvent);
      expect(result).toEqual(savedEvent);
    });

    it('should log event without optional fields', async () => {
      // Arrange
      const logEventDto = {
        eventType: SecurityEventType.LOGIN_FAILED,
        description: 'Failed login attempt',
      };

      const savedEvent = TestFactories.createSecurityEvent(logEventDto);
      mockSecurityEventRepository.create.mockReturnValue(savedEvent);
      mockSecurityEventRepository.save.mockResolvedValue(savedEvent);

      // Act
      const result = await securityService.logEvent(logEventDto);

      // Assert
      expect(mockSecurityEventRepository.create).toHaveBeenCalledWith(logEventDto);
      expect(result).toEqual(savedEvent);
    });

    it('should handle repository errors when logging event', async () => {
      // Arrange
      const logEventDto = {
        eventType: SecurityEventType.PASSWORD_CHANGED,
        userId: 'user-123',
      };

      const error = new Error('Database connection failed');
      mockSecurityEventRepository.create.mockReturnValue({});
      mockSecurityEventRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(securityService.logEvent(logEventDto)).rejects.toThrow(error);
    });
  });

  describe('getSecurityEvents', () => {
    it('should return security events for a user', async () => {
      // Arrange
      const userId = 'user-123';
      const limit = 10;
      const mockEvents = [
        TestFactories.createSecurityEvent({ userId }),
        TestFactories.createSecurityEvent({ userId }),
      ];

      mockSecurityEventRepository.find.mockResolvedValue(mockEvents);

      // Act
      const result = await securityService.getSecurityEvents(userId, limit);

      // Assert
      expect(mockSecurityEventRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
      expect(result).toEqual(mockEvents);
      expect(result).toHaveLength(2);
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      const userId = 'user-123';
      const mockEvents = [TestFactories.createSecurityEvent({ userId })];
      
      mockSecurityEventRepository.find.mockResolvedValue(mockEvents);

      // Act
      const result = await securityService.getSecurityEvents(userId);

      // Assert
      expect(mockSecurityEventRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50, // Default limit
      });
      expect(result).toEqual(mockEvents);
    });

    it('should return empty array when no events found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockSecurityEventRepository.find.mockResolvedValue([]);

      // Act
      const result = await securityService.getSecurityEvents(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getRecentFailedLogins', () => {
    it('should return count of recent failed logins for IP address', async () => {
      // Arrange
      const ipAddress = '192.168.1.100';
      const timeWindow = 3600000; // 1 hour
      const expectedCount = 5;

      mockSecurityEventRepository.count.mockResolvedValue(expectedCount);

      // Act
      const result = await securityService.getRecentFailedLogins(ipAddress, timeWindow);

      // Assert
      const since = new Date(Date.now() - timeWindow);
      
      expect(mockSecurityEventRepository.count).toHaveBeenCalledWith({
        where: {
          eventType: SecurityEventType.LOGIN_FAILED,
          ipAddress,
          createdAt: since,
        },
      });
      expect(result).toBe(expectedCount);
    });

    it('should use default time window when not provided', async () => {
      // Arrange
      const ipAddress = '192.168.1.100';
      const expectedCount = 3;
      const defaultTimeWindow = 3600000; // 1 hour

      mockSecurityEventRepository.count.mockResolvedValue(expectedCount);

      // Act
      const result = await securityService.getRecentFailedLogins(ipAddress);

      // Assert
      const since = new Date(Date.now() - defaultTimeWindow);
      
      expect(mockSecurityEventRepository.count).toHaveBeenCalledWith({
        where: {
          eventType: SecurityEventType.LOGIN_FAILED,
          ipAddress,
          createdAt: since,
        },
      });
      expect(result).toBe(expectedCount);
    });

    it('should return 0 when no failed logins found', async () => {
      // Arrange
      const ipAddress = '192.168.1.200';
      mockSecurityEventRepository.count.mockResolvedValue(0);

      // Act
      const result = await securityService.getRecentFailedLogins(ipAddress);

      // Assert
      expect(result).toBe(0);
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle very large limit in getSecurityEvents', async () => {
      // Arrange
      const userId = 'user-123';
      const largeLimit = 1000;
      const mockEvents = Array(1000).fill(null).map(() => 
        TestFactories.createSecurityEvent({ userId })
      );

      mockSecurityEventRepository.find.mockResolvedValue(mockEvents);

      // Act
      const result = await securityService.getSecurityEvents(userId, largeLimit);

      // Assert
      expect(mockSecurityEventRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: largeLimit,
      });
      expect(result).toHaveLength(1000);
    });

    it('should handle zero time window in getRecentFailedLogins', async () => {
      // Arrange
      const ipAddress = '192.168.1.100';
      const zeroTimeWindow = 0;
      mockSecurityEventRepository.count.mockResolvedValue(0);

      // Act
      const result = await securityService.getRecentFailedLogins(ipAddress, zeroTimeWindow);

      // Assert
      const since = new Date(Date.now() - zeroTimeWindow);
      expect(mockSecurityEventRepository.count).toHaveBeenCalledWith({
        where: {
          eventType: SecurityEventType.LOGIN_FAILED,
          ipAddress,
          createdAt: since,
        },
      });
      expect(result).toBe(0);
    });
  });
});