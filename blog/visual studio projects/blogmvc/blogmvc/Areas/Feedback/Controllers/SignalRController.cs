using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BlogMvc.Areas.Feedback.Models;

namespace BlogMvc.Areas.Feedback.Controllers
{
    public class SignalRController : Controller
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
            Guid taskId = Guid.NewGuid();
            taskService.StartASynchronousTaskSignalR(taskId.ToString());
            return RedirectToAction("WaitForCompletion", new { taskid= taskId});
        }

        [HttpGet]
        public ActionResult WaitForCompletion(Guid taskId)
        {
            if (taskService.GetResult(taskId.ToString()) == null)
            {
                return View("WaitForCompletion", taskId);
            }
            return RedirectToAction("Completed", new { taskid = taskId });
        }

        [HttpGet]
        public ActionResult Completed(Guid taskId)
        {
            TaskResult result = taskService.GetResult(taskId.ToString()) as TaskResult;
            return View(result);
        }

    }
}
