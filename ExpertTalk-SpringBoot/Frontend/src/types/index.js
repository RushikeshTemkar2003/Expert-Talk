// Type definitions converted to JSDoc comments for reference

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {number} userType
 * @property {number} [categoryId]
 * @property {string} [categoryName]
 * @property {number} [hourlyRate]
 * @property {string} [bio]
 * @property {boolean} isAvailable
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {number} expertCount
 */

/**
 * @typedef {Object} Expert
 * @property {number} id
 * @property {string} name
 * @property {string} bio
 * @property {number} hourlyRate
 * @property {boolean} isAvailable
 * @property {string} categoryName
 */

/**
 * @typedef {Object} ChatSession
 * @property {number} id
 * @property {string} startTime
 * @property {string} [endTime]
 * @property {number} status
 * @property {number} totalAmount
 * @property {string} userName
 * @property {string} expertName
 * @property {string} [lastMessage]
 * @property {number} unreadCount
 */

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {string} content
 * @property {string} sentAt
 * @property {boolean} isRead
 * @property {number} senderId
 * @property {string} senderName
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} [phone]
 * @property {number} userType
 * @property {number} [categoryId]
 * @property {number} [hourlyRate]
 * @property {string} [bio]
 */

/**
 * @typedef {Object} LoginData
 * @property {string} email
 * @property {string} password
 */