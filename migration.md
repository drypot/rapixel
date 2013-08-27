##

	shell: mv /data2/rapixel/upload/* /data2/rapixel


##

	shell: node lib/user-script/add-namel.js --config config/live-

	shell: rename upload/public/photo to images

	mongo: db.users.dropIndexes();

	mongo: db.photos.renameCollection('images')


## done

	db.users.update({}, { $set: { footer: '' }}, { multi: true })

	db.photos.dropIndexes();

	db.photos.update({ userId: { $exists: true } },
		{ $rename: { userId: 'uid' } },
		{ multi: true }
	);
