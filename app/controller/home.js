const { Controller } = require("egg");
const moment = require("moment");

class HomeController extends Controller {
  getDuration(create, finish) {
    const duration = moment(finish).valueOf() - moment(create).valueOf();
    let time = moment.duration(duration, "millisecond"); //得到一个对象，里面有对应的时分秒等时间对象值
    let hours = time.hours();
    let minutes = time.minutes();
    let seconds = time.seconds();
    if (hours < 1) {
      return moment({ m: minutes, s: seconds }).format("mm:ss");
    }
    return moment({ h: hours, m: minutes, s: seconds }).format("HH:mm:ss");
  }
  async pipelineHook(body, key) {
    let content = "";
    const {
      object_attributes = {
        created_at: moment(),
        finished_at: moment().add(1, "hour"),
        ref: "testing",
      },
      user = { username: "arno" },
      project = { name: "console" },
      commit = { message: "none" },
    } = body;
    const { username } = user;
    const { name } = project;
    const { message } = commit;
    const { created_at, finished_at, status, detailed_status, ref } =
      object_attributes;
    if (status === "pending") {
      content = `# Console前端 开始构建 \n \n<font color="comment">项目名称</font>：<font color="info">${name}</font>\n<font color="comment">构建分支</font>：${ref}\n<font color="comment">构建人</font>：${username}\n<font color="comment">最新提交</font>：${message}`;
    }
    if (detailed_status === "passed" || detailed_status === "failed") {
      const color = detailed_status === "passed" ? "info" : "warning";
      content = `# Console前端 构建完成 \n \n<font color="comment">项目名称</font>：<font color="info">${name}</font>\n<font color="comment">构建分支</font>：${ref}\n<font color="comment">构建人</font>：${username}\n<font color="comment">构建结果</font>：<font color="${color}">${detailed_status}</font> \n<font color="comment">构建用时</font>：${this.getDuration(
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
    if (body.object_kind === "pipeline") {
      await this.pipelineHook(body, key);
      ctx.body = "Hello Webhook";
    } else {
      ctx.body = "Hello Webhook";
    }
  }
}

module.exports = HomeController;
