/**
 * Payme Integration Library
 * Handles payment creation, verification and callbacks
 */

import { ObjectId } from 'mongodb';

// Payme konfiguratsiyasi
export const PAYME_CONFIG = {
    merchantId: process.env.PAYME_MERCHANT_ID,
    secretKey: process.env.PAYME_SECRET_KEY,
    endpoint: process.env.PAYME_ENDPOINT || 'https://checkout.paycom.uz/api',
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payme/callback`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?payment=success`,
    minAmount: 1000, // Minimal to'lov summasi (so'm)
};

/**
 * Generate Payme checkout URL
 * @param {string} orderId - Unique order ID
 * @param {number} amount - Amount in so'm
 * @param {object} account - Account info (userId, etc)
 * @returns {string} Payme checkout URL
 */
export function generatePaymeUrl(orderId, amount, account) {
    const amountInTiyin = amount * 100; // Convert so'm to tiyin
    
    // Create merchant string: m={merchantId};ac.{key}={value};a={amount};c={callback}
    const merchantId = PAYME_CONFIG.merchantId;
    const accountParams = Object.entries(account)
        .map(([key, value]) => `ac.${key}=${value}`)
        .join(';');
    
    const params = `m=${merchantId};${accountParams};a=${amountInTiyin};c=${encodeURIComponent(PAYME_CONFIG.returnUrl)}`;
    
    // Encode to base64
    const encodedParams = Buffer.from(params).toString('base64');
    
    return `https://checkout.paycom.uz/${encodedParams}`;
}

/**
 * Verify Payme callback signature
 * @param {string} authorization - Authorization header from Payme
 * @returns {boolean} Is signature valid
 */
export function verifyPaymeSignature(authorization) {
    console.log('🔐 Verifying Payme signature...');
    console.log('Authorization header:', authorization);
    console.log('Expected secret key:', PAYME_CONFIG.secretKey);
    
    if (!authorization || !authorization.startsWith('Basic ')) {
        console.log('❌ No authorization header or wrong format');
        return false;
    }

    const credentials = Buffer.from(authorization.slice(6), 'base64').toString();
    const [username, password] = credentials.split(':');
    
    console.log('Received username:', username);
    console.log('Received password:', password);
    console.log('Expected username: Paycom');
    console.log('Expected password:', PAYME_CONFIG.secretKey);

    const isValid = username === 'Paycom' && password === PAYME_CONFIG.secretKey;
    console.log('Signature valid:', isValid);
    
    return isValid;
}

/**
 * Generate Payme error response
 * @param {number} code - Error code
 * @param {string} message - Error message
 * @param {string} data - Additional data
 * @returns {object} Error response
 */
export function generatePaymeError(code, message, data = null) {
    return {
        error: {
            code,
            message: message || getPaymeErrorMessage(code),
            data
        }
    };
}

/**
 * Get Payme error message by code
 */
function getPaymeErrorMessage(code) {
    const errors = {
        '-32700': 'Parse error',
        '-32600': 'Invalid Request',
        '-32601': 'Method not found',
        '-32602': 'Invalid params',
        '-32603': 'Internal error',
        '-31001': 'Wrong amount',
        '-31003': 'Transaction not found',
        '-31008': 'Transaction cancelled',
        '-31050': 'Order not found',
        '-31051': 'Order already paid',
    };
    return errors[code] || 'Unknown error';
}

/**
 * Payme RPC Methods Handler
 */
export class PaymeRPC {
    constructor(db) {
        this.db = db;
    }

    async handleRequest(method, params) {
        switch (method) {
            case 'CheckPerformTransaction':
                return await this.checkPerformTransaction(params);
            case 'CreateTransaction':
                return await this.createTransaction(params);
            case 'PerformTransaction':
                return await this.performTransaction(params);
            case 'CancelTransaction':
                return await this.cancelTransaction(params);
            case 'CheckTransaction':
                return await this.checkTransaction(params);
            case 'GetStatement':
                return await this.getStatement(params);
            default:
                throw generatePaymeError(-32601, 'Method not found');
        }
    }

    async checkPerformTransaction(params) {
        const { amount, account } = params;
        
        // Check if user exists
        const user = await this.db.collection('users').findOne({ 
            _id: new ObjectId(account.userId) 
        });

        if (!user) {
            throw generatePaymeError(-31050, 'Order not found');
        }

        // Check amount
        if (amount < PAYME_CONFIG.minAmount * 100) {
            throw generatePaymeError(-31001, 'Wrong amount');
        }

        return { allow: true };
    }

    async createTransaction(params) {
        const { id, time, amount, account } = params;

        // Check if transaction already exists
        let transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (transaction) {
            if (transaction.state !== 1) {
                throw generatePaymeError(-31008, 'Transaction cancelled');
            }
            return {
                create_time: transaction.createTime,
                transaction: transaction._id.toString(),
                state: transaction.state
            };
        }

        // Create new transaction
        const newTransaction = {
            paymeTransactionId: id,
            userId: account.userId,
            amount: amount / 100, // Convert tiyin to so'm
            state: 1, // Created
            createTime: time,
            performTime: 0,
            cancelTime: 0,
            reason: null,
            createdAt: new Date()
        };

        const result = await this.db.collection('payme_transactions').insertOne(newTransaction);

        return {
            create_time: time,
            transaction: result.insertedId.toString(),
            state: 1
        };
    }

    async performTransaction(params) {
        const { id } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        if (transaction.state === 1) {
            // Update user balance
            await this.db.collection('users').updateOne(
                { _id: new ObjectId(transaction.userId) },
                { $inc: { balance: transaction.amount } }
            );

            // Update transaction state
            const performTime = Date.now();
            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: 2, // Performed
                        performTime 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                perform_time: performTime,
                state: 2
            };
        }

        if (transaction.state === 2) {
            return {
                transaction: transaction._id.toString(),
                perform_time: transaction.performTime,
                state: 2
            };
        }

        throw generatePaymeError(-31008, 'Transaction cancelled');
    }

    async cancelTransaction(params) {
        const { id, reason } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        const cancelTime = Date.now();

        if (transaction.state === 1) {
            // Cancel created transaction
            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: -1, // Cancelled
                        cancelTime,
                        reason 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                cancel_time: cancelTime,
                state: -1
            };
        }

        if (transaction.state === 2) {
            // Refund performed transaction
            await this.db.collection('users').updateOne(
                { _id: new ObjectId(transaction.userId) },
                { $inc: { balance: -transaction.amount } }
            );

            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: -2, // Refunded
                        cancelTime,
                        reason 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                cancel_time: cancelTime,
                state: -2
            };
        }

        return {
            transaction: transaction._id.toString(),
            cancel_time: transaction.cancelTime,
            state: transaction.state
        };
    }

    async checkTransaction(params) {
        const { id } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        return {
            create_time: transaction.createTime,
            perform_time: transaction.performTime,
            cancel_time: transaction.cancelTime,
            transaction: transaction._id.toString(),
            state: transaction.state,
            reason: transaction.reason
        };
    }

    async getStatement(params) {
        const { from, to } = params;

        const transactions = await this.db.collection('payme_transactions')
            .find({
                createTime: { $gte: from, $lte: to }
            })
            .toArray();

        return {
            transactions: transactions.map(t => ({
                id: t.paymeTransactionId,
                time: t.createTime,
                amount: t.amount * 100,
                account: { userId: t.userId },
                create_time: t.createTime,
                perform_time: t.performTime,
                cancel_time: t.cancelTime,
                transaction: t._id.toString(),
                state: t.state,
                reason: t.reason
            }))
        };
    }
}
