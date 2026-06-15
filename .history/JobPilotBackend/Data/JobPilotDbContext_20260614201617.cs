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
    public DbSet<UserJobSwipe> UserJobSwipes { get; set; }
    public DbSet<UserResume> UserResumes { get; set; }
    public DbSet<ResumeAnalysisResult> ResumeAnalysisResults { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<CoverLetter> CoverLetters { get; set; }
    public DbSet<User

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInterview>()
            .Property(p => p.Id)
            .HasDefaultValueSql("gen_random_uuid()");
    }
}