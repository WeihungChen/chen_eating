async function fetchPost(url, body, contentType)
{
	if(url.length == 0 || contentType.length == 0)
		return;
	
	var header = 
	{
		"Content-Type": contentType
	};
	console.log(url);
	var res = await fetch(url, {
		method: 'POST',
		headers: header,
		body: JSON.stringify(body)
	});
	var result = await res.json();
	if(res.status != 200 && result.error != null)
	{
		if(result.error.String != null)
			alert(result.error.String);
		else
			alert(result.error);
	}
	return [res.status, result.data, result.error];
}

export {
    fetchPost
};