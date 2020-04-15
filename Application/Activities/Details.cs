using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<Activity>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Activity>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Activity> Handle(Query query, CancellationToken cancellationToken)
            {
                var activityFromDB = await _context.Activities.FindAsync(query.Id);
                if (activityFromDB == null)
                    throw new RestException(HttpStatusCode.NotFound, new {activity = "Not found"});

                return activityFromDB;
            }
        }
    }
}