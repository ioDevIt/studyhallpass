import crypto from 'node:crypto'

const algo = 'aes-256-gcm'
// const ENCRYPTION_KEY_HEX = '6162636465666768696a6b6c6d6e6f707172737475767778797a313233343536'; 
// const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY_HEX, 'hex');
const algoKey =  Buffer.from(process.env.ENCRYPTION_KEY_HEX, 'hex'); // crypto.randomBytes(32)
const ivLength = 12

console.log('process.env().',process.env.ENCRYPTION_KEY_HEX)

export const encrypt=(thisText)=>{
    const iv = crypto.randomBytes(ivLength)
    const cipher = crypto.createCipheriv(algo,algoKey,iv)
    let encrypted = cipher.update(thisText,'utf8','hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    console.log('algoKey',algoKey)

    return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export const decrypt=(encryptedData)=>{
    const [ivHex, authTagHex,encryptedText] = encryptedData.split(':')

    const iv = Buffer.from(ivHex,'hex')
    const authTag = Buffer.from(authTagHex,'hex')
    const decipher = crypto.createDecipheriv(algo,algoKey,iv)

    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedText,'hex','utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}


export const testEncryDecrypt=()=>{
    const toEncrypt ="This is a test"
    const encrypted = encrypt(toEncrypt)
    console.log('encrypted',encrypted)

    const decrypted = decrypt(encrypted)

    console.log('decrypted',decrypted)
}

export const decryptData=(thisData)=>{
    // 000c903a19a0818056d4c396:e5cfd92075d1ecf21dcde4b30aa6ff47:eae6cbc3b0c634e0bd5ebf0e1395
    thisData='5f7aa6d19ec0e679aa07730b:7c49f29c0af3049fc9945c2ded9aa352:0a8eb2fa184fea69a0bbf9b498b5'
        const decrypted = decrypt(thisData)

    console.log('decrypted',decrypted)
}