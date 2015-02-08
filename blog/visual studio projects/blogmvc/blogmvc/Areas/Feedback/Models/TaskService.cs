using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Caching;
using Microsoft.AspNet.SignalR;

namespace BlogMvc.Areas.Feedback.Models
{
    public class TaskService
    {
        public TaskResult StartSynchronousTask()
        {
            TaskResult result = new TaskResult() { StartTime = DateTime.Now };
            SleepForSeconds(new Random().Next(45) + 10);
            result.EndTime = DateTime.Now;
            return result;
        }

        private void SleepForSeconds(int seconds)
        {
            System.Threading.Thread.Sleep(seconds * 1000);
        }

        public void StartASynchronousTask(string key)
        {
            HttpRuntime.Cache.Remove(key);

            System.Threading.Tasks.Task.Factory.StartNew(() =>
            {
                TaskResult result = new TaskResult() { StartTime = DateTime.Now };

                SleepForSeconds(new Random().Next(45) + 10);

                result.EndTime = DateTime.Now;

                HttpRuntime.Cache.Insert(
                    key,
                    result,
                    null,
                    DateTime.Now.AddMinutes(20),
                    System.Web.Caching.Cache.NoSlidingExpiration,
                    CacheItemPriority.Normal,
                    null);
            });
        }

        public void StartASynchronousTaskSignalR(string key)
        {
            HttpRuntime.Cache.Remove(key);

            System.Threading.Tasks.Task.Factory.StartNew(() =>
            {
                TaskResult result = new TaskResult() { StartTime = DateTime.Now };

                for (int i = new Random().Next(45) + 10; i > 0;i-- )
                {
                    new TaskConnection().Send(key,string.Format("Task says: I will finish in {0} seconds",i));
                    System.Threading.Thread.Sleep(1000);
                }

                new TaskConnection().Send(key,"Finished");

                result.EndTime = DateTime.Now;

                HttpRuntime.Cache.Insert(
                    key,
                    result,
                    null,
                    DateTime.Now.AddMinutes(20),
                    System.Web.Caching.Cache.NoSlidingExpiration,
                    CacheItemPriority.Normal,
                    null);
            });
        }

        public object GetResult(string key)
        {
            return HttpRuntime.Cache[key];
        }

        public void StartASynchronousTasks(string key, int number)
        {
            List<TaskResult> results = new List<TaskResult>();

            HttpRuntime.Cache.Insert(
                    key,
                    results,
                    null,
                    DateTime.Now.AddMinutes(20),
                    System.Web.Caching.Cache.NoSlidingExpiration,
                    CacheItemPriority.Normal,
                    null);

            for (int i = 0; i < number; i++)
            {
                System.Threading.Tasks.Task.Factory.StartNew(() =>
               {
                   TaskResult result = new TaskResult()
                   {
                       Name = "Task " + i,
                       StartTime = DateTime.Now
                   };

                   SleepForSeconds(new Random().Next(45) + 10);

                   result.EndTime = DateTime.Now;
                   results.Add(result);
               });
            }
        }
    }

    public class TaskResult
    {
        public string Name { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public long TotalSeconds
        {
            get
            {
                return (long)(EndTime - StartTime).TotalSeconds;
            }
        }
    }
}