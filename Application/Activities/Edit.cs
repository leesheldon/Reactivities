using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }

            public string Title { get; set; }

            public string Category { get; set; }

            public string Description { get; set; }

            public DateTime? Date { get; set; }

            public string City { get; set; }

            public string Venue { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var activityFromDb = await _context.Activities.FindAsync(request.Id);
                if (activityFromDb == null)
                    throw new Exception("Could not find activity.");

                activityFromDb.Title = request.Title ?? activityFromDb.Title;
                activityFromDb.Description = request.Description ?? activityFromDb.Description;
                activityFromDb.Category = request.Category ?? activityFromDb.Category;
                activityFromDb.Date = request.Date ?? activityFromDb.Date;
                activityFromDb.City = request.City ?? activityFromDb.City;
                activityFromDb.Venue = request.Venue ?? activityFromDb.Venue;

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new Exception("Problem saving changes.");
            }
        }
    }
}