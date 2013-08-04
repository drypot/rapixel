##

	mongo: db.users.dropIndexes();

	shell: node lib/user-script/add-namel.js config/

	shell: rename upload/public/photo to images

	mongo: db.photos.renameCollection('images')


##

	db.users.update({}, { $set: { footer: '' }}, { multi: true })

	db.photos.dropIndexes();

	db.photos.update({ userId: { $exists: true } },
		{ $rename: { userId: 'uid' } },
		{ multi: true }
	);