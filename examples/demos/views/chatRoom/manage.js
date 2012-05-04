<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>管理聊天室</title>
</head>
<body>
<table>
	<tr><td>名称</td><td>管理员</td><td>启动时间</td><td>人数</td><td>操作</td></tr>
<% if (roomList) {%>
<% roomList.forEach(function(room, i){
	<tr>
		<td>room.title</td>
		<td>room.creater</td>
		<td></td>
		<td></td>
		<td>
			<% if(room.status) {%>
			<a href="javascript:return false;" onclick="stop('<%=room._id%>')">停止</a>
			<%}else{%>
			<a href="javascript:return false;" onclick="start('<%=room._id%>')">启动</a>
			<%}%>
		</td>
	</tr>
}) %>
<%}%>
<%}%>
</table>
</body>
</html>