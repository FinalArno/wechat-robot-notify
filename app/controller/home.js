const { Controller } = require("egg");

class HomeController extends Controller {
  async hook(body, query) {
    // 组织消息要发送的信息，支持 markdown
    const data = {
      msgtype: "markdown",
      markdown: {
        content: `##小飞棍来了`,
      },
    };
    const { key } = query;
    if (!key) {
      return;
    }
    // 通知企业微信机器人
    await this.ctx.curl(
      `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}` /* 机器人的 webhook url */,
      {
        method: "POST",
        contentType: "json",
        data,
        dataType: "json",
      }
    );
    return true;
  }

  async index() {
    const { ctx } = this;
    ctx.body = "Hello Index";
  }

  async webhook() {
    const { ctx } = this;
    const body = ctx.request.body;
    const query = ctx.request.query;
    console.log("body---", body, query);
    ctx.logger.info("some request data: %j", body, query);
    if (body.event_type === "push_event") {
      await this.hook(body, query);
      ctx.body = "Hello Webhook";
    } else {
      ctx.body = "Hello Webhook";
    }
  }
}

module.exports = HomeController;
