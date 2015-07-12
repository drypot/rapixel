# Migration

##
    nginx:  
        location ~ /(?:css|image|js|lib)/ ->

            location /static/ {
            }

            location /static/bower/ {
              alias /Users/drypot/projects/rapixel/website/bower_components/;
            }
    
    ftp copy config.json files.

## done

    $ mv /data2/rapixel/upload/* /data2/rapixel

    $ node lib/image-script/add-comment.js --config config/osoky-live.json

## done

    $ node lib/user-script/add-namel.js --config config/live-

    $ rename upload/public/photo to images

    > db.users.dropIndexes();

    > db.photos.renameCollection('images')


## done

    > db.users.update({}, { $set: { footer: '' }}, { multi: true })

    > db.photos.dropIndexes();

    > db.photos.update({ userId: { $exists: true } },
      { $rename: { userId: 'uid' } },
      { multi: true }
    );
