var any = function (arr, cb) {
	var isTrue = false;
	for (var i = 0; i < arr.length; i++){
		var cbOutput = cb(arr[i]);
		var newArr = [];
		if (cbOutput) {
		return true;
        } if () {newArr.push(cbOutput);
            return newArr;}
    }

}
any([1,2,3], function (num) {return num === 2});