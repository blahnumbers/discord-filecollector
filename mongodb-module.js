const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoUser, mongoPass, mongoUrl } = require('./config-mongo.json');
const { clientId, useCollectionPerServer } = require('./config.json');
const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoUrl}/?retryWrites=true&w=majority`;

const mongo = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = mongo.db('main');

exports.findFile = async function findFile(fileHash, guildId) {
	try {
		const storage = db.collection('data-storage' + (useCollectionPerServer ? guildId : ''));
		const query = { hash: fileHash };
		const results = await storage.findOne(query);
	
		return results;
	}
	catch (e) {
		console.log("mongo findFile error: " + e);
	}
}

exports.addFile = async function addFile(fileInfo, fileHash, user, guildId) {
	try {
		const storage = db.collection('data-storage' + (useCollectionPerServer ? guildId : ''));
		const file = {
			hash: fileHash,
			url: fileInfo.url,
			name: fileInfo.name,
			size: fileInfo.size,
			date: new Date(),
			user: user.id,
			username: user.username + "#" + user.discriminator
		}
		const result = await storage.insertOne(file);
		
		return result;
	}
	catch (e) {
		console.log("mongo addFile error: " + e);
	}
}
