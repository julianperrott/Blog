using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using BlogMvc.Areas.Feedback.Models;
using Owin;

[assembly: OwinStartup(typeof(BlogMvc.StartupOwin))]

namespace BlogMvc
{
    public class StartupOwin
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR<TaskConnection>("/echo");
        }
    }
}
