using Microsoft.EntityFrameworkCore;
public class JobPilotDbContext : DbContext
{
    public  JobPilotDbContext(DbContextOptions<JobPilotDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Job> Jobs { get; set; }
}