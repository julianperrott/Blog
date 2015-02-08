using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BlogMvc.Areas.Feedback.Models;


namespace BlogMvc.Areas.Feedback.Controllers
{
    public class PostRedirectGetController : Controller
    {
        TaskService taskService = new TaskService();
        DateTime startTime = DateTime.Now;

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public RedirectToRouteResult RunSynchronousTask()
        {
            TaskResult result= taskService.StartSynchronousTask();
            this.Session["TaskResult"] = result;
            return this.RedirectToAction("Completed");
        }

        [HttpGet]
        public ActionResult Completed()
        {
            return View(this.Session["TaskResult"] as TaskResult);
        }
    }
}
