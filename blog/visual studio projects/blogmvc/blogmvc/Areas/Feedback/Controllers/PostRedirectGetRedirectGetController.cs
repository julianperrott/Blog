using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BlogMvc.Areas.Feedback.Models;


namespace BlogMvc.Areas.Feedback.Controllers
{
    public class PostRedirectGetRedirectGetController : Controller
    {
        TaskService taskService = new TaskService();

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public RedirectToRouteResult RunAsynchronousTask()
        {
            this.Session["StartTime"] = DateTime.Now;
            this.Session["PageRefreshed"]=0;
            taskService.StartASynchronousTask(this.Session.SessionID);
            return RedirectToAction("WaitForCompletion");
        }

        [HttpGet]
        public ActionResult WaitForCompletion()
        {
            bool complete = taskService.GetResult(this.Session.SessionID) != null;

            if (complete)
            {
                return RedirectToAction("Completed");
            }
            else
            {
                int PageRefreshed = int.Parse(this.Session["PageRefreshed"].ToString());
                PageRefreshed = PageRefreshed + 1;
                this.Session["PageRefreshed"] = PageRefreshed;

                return View(PageRefreshed);
            }
        }

        [HttpGet]
        public ActionResult Completed()
        {
            TaskResult result = taskService.GetResult(this.Session.SessionID) as TaskResult;
            return View(result);
        }

    }
}
