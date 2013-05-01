for var in server/test/*-test.js; do
	echo mocha $var
	mocha $var
	if [ $? -ne 0 ]; then
		break
	fi
done

