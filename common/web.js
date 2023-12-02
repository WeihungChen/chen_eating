async function fetchPost(url, body, contentType)
{
	if(url.length == 0 || contentType.length == 0)
		return;
	
	var header = 
	{
		"Content-Type": contentType
	};
	var res = await fetch(url, {
		method: 'POST',
		headers: header,
		body: JSON.stringify(body)
	});
	if(res.status == 429)
	{
		alert(res.statusText);
		return [res.status, {}, res.statusText];
	}
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