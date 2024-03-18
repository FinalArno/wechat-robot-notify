const { Controller } = require("egg");
const moment = require("moment");

class HomeController extends Controller {
  getDuration(create, finish) {
    const duration = moment(finish).valueOf() - moment(create).valueOf();
    let time = moment.duration(duration, "millisecond"); //得到一个对象，里面有对应的时分秒等时间对象值
    let hours = time.hours();
    let minutes = time.minutes();
    let seconds = time.seconds();
    console.log(
      moment({ h: hours, m: minutes, s: seconds }).format("HH:mm:ss")
    );
  }
  async pipelineHook(body, key) {
    let content = "";
    const {
      object_attributes = {},
      user = {},
      project = {},
      commit = {},
    } = body;
    const { username } = user;
    const { name } = project;
    const { message } = commit;
    const { created_at, finished_at, status, detailed_status, ref } =
      object_attributes;
    if (status === "pending") {
      content = `# Console 前端【**${name}**】${ref} 开始构建 \n <font color=666>构建人</font>：${username}\n <font color=666>最新提交</font>：${message}`;
    }
    if (detailed_status === "passed" || detailed_status === "failed") {
      content = `# Console 前端【**${name}**】${ref} 构建完成 \n <font color=666>构建人</font>：${username}\n <font color=666>构建结果</font>：${detailed_status} \n <font color=666>构建用时</font>：${getDuration(
        created_at,
        finished_at
      )}`;
    }
    const data = {
      msgtype: "markdown",
      markdown: {
        content,
      },
    };

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
    const { key } = query;
    if (!key) {
      ctx.body = "Hello Webhook";
      return;
    }
    console.log("body---", body, query);
    ctx.logger.info("some request data: %j", body, query);
    if (body.object_kind === "pipeline") {
      await this.pipelineHook(body, key);
      ctx.body = "Hello Webhook";
    } else {
      ctx.body = "Hello Webhook";
    }
  }
}

module.exports = HomeController;
