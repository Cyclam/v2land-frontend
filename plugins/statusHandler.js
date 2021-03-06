export default async ({ app, route, redirect, store }) => {
  const checkStatus = (route, next = redirect) => {
    const query = route.query;
    switch (query.status) {
    case 'event_not_found':
      app.$message.error('该事件不存在或未被公开');
      break;
    case 'logged_in':
      app.$message.error('登录用户不可访问该页面');
      break;
    case 'permission_denied':
      app.$message.error('您所在用户组无法访问该页面');
      break;
    case 'auth_required':
      app.$message.error('请在登录后尝试访问该页面');
      break;
    case 'auth_failed':
      app.$message.error('在验证绑定状况时发生了错误');
      break;
    case 'logged_in_successfully':
      app.$message.success(`你好，${store.state.client.username}`);
      break;
    case 'authenticate_successfully':
      app.$message.success(`成功绑定账号 @${query.auth_name}`);
      delete query.auth_name;
      break;
    case 'verify_successfully':
      app.$message.success('成功验证邮箱');
      break;
    case 'missing_verification_parameter':
      app.$message.error('缺少验证参数，请确认链接是否正确并完整');
      break;
    case 'verification_failed':
      app.$message.error('邮箱验证失败：' + query.error_message);
      delete query.error_message;
      break;
    }

    delete query.status;

    next({
      ...route,
      query,
    });
  };

  checkStatus(route);

  app.router.afterEach((to, from, next) => {
    setTimeout(() => {
      checkStatus(to, next);
    }, 0);
  });
};
