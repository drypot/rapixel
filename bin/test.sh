for var in lib/${1-**}/*-test.js; do
	echo mocha $var
	mocha $var
	if [ $? -ne 0 ]; then
		break
	fi
done

