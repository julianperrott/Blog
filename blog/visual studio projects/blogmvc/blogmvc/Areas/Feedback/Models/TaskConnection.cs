using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
using Microsoft.AspNet.SignalR;

namespace BlogMvc.Areas.Feedback.Models
{
    public class TaskConnection : PersistentConnection
    {
        protected override Task OnConnected(IRequest request, string connectionId)
        {
            return Connection.Send(connectionId, "SignalR: Welcome, you are connected.");
        }

        public void Send(string key,string message)
        {
            if (HttpRuntime.Cache[FormatKey(key)] != null)
            {
                GlobalHost.ConnectionManager.GetConnectionContext<TaskConnection>().Connection.Send(HttpRuntime.Cache[FormatKey(key)] as string, message);
            }
        }

        private string FormatKey(string key)
        {
            return "TaskConnection:" + key;
        }

        protected override Task OnReceived(IRequest request, string connectionId, string data)
        {
            HttpRuntime.Cache.Insert(
                    FormatKey(data),
                    connectionId,
                    null,
                    DateTime.Now.AddMinutes(20),
                    System.Web.Caching.Cache.NoSlidingExpiration,
                    CacheItemPriority.Normal,
                    null);

            return Connection.Send(connectionId, "SignalR: You are listening for taskId: " + data);
        }
    }
}