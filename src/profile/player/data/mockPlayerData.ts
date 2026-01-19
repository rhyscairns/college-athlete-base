// Mock data for player profile UI development
export const mockPlayerData = {
    // Basic Info
    id: 'player-123',
    firstName: 'Marcus',
    lastName: 'Johnson',
    initials: 'MJ',
    classYear: '2025',
    position: 'Wide Receiver',
    school: 'Westlake High School',
    location: 'Austin, TX',

    // Physical Stats
    height: "6'2\"",
    weight: '185 lbs',
    age: 17,

    // Performance Metrics
    performanceMetrics: [
        { label: '4.45s 40-Yard Dash', value: '4.45s' },
        { label: '36" Vertical', value: '36"' },
        { label: '245lb Bench', value: '245lb' },
    ],

    // Academic Profile
    academic: {
        ncaaEligibilityCenter: '#2345678901',
        ncaaQualifier: true,
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        satScore: 1350,
        satMath: 680,
        satReading: 670,
        actScore: undefined,
        classRank: 'Top 10%',
        classRankDetail: '45 out of 450 Students',
        coursework: [
            'AP Calculus AB',
            'AP Physics',
            'National Honor Society',
        ],
    },

    // Game Highlights
    videos: [
        {
            id: 'video-1',
            title: 'Junior Season Official Highlights (2023-24)',
            description: 'Full season compilation • 12 TDs • 1,200+ Yards',
            url: 'https://youtube.com/watch?v=example1',
            thumbnail: '/images/video-thumb-1.jpg',
            duration: '5:45',
            isFeatured: true,
            date: 'Sept 2023',
        },
        {
            id: 'video-2',
            title: 'Season Opener vs. North High',
            description: '',
            url: 'https://youtube.com/watch?v=example2',
            thumbnail: '/images/video-thumb-2.jpg',
            duration: '3:45',
            isFeatured: false,
            date: 'Sept 2023',
        },
        {
            id: 'video-3',
            title: 'Playoff Quarterfinals Highlights',
            description: '',
            url: 'https://youtube.com/watch?v=example3',
            thumbnail: '/images/video-thumb-3.jpg',
            duration: '2:15',
            isFeatured: false,
            date: 'Nov 2023',
        },
        {
            id: 'video-4',
            title: '7-on-7 Summer Circuit',
            description: '',
            url: 'https://youtube.com/watch?v=example4',
            thumbnail: '/images/video-thumb-4.jpg',
            duration: '4:30',
            isFeatured: false,
            date: 'July 2023',
        },
    ],

    // Coaches' Perspective
    coachTestimonials: [
        {
            id: 'testimonial-1',
            quote: 'Marcus is the first one on the field and the last one to leave. His work ethic sets the tone for our entire program. He&apos;s not just a playmaker; he&apos;s a leader.',
            coachName: 'Coach David Miller',
            coachTitle: 'Head Football Coach',
            coachOrganization: 'Westlake High School',
        },
        {
            id: 'testimonial-2',
            quote: 'Rare combination of speed, size, and football IQ. He understands coverages better than most college freshmen I&apos;ve seen. An absolute steal for any program.',
            coachName: 'James Wilson',
            coachTitle: 'Offensive Coordinator',
            coachOrganization: 'Westlake High School',
        },
        {
            id: 'testimonial-3',
            quote: 'A fierce competitor who elevates everyone around him. In clutch moments, you want the ball in his hands. He thrives under pressure.',
            coachName: 'Sarah Thomas',
            coachTitle: 'Athletic Director',
            coachOrganization: 'Westlake Athletics',
        },
    ],

    // Athletic Achievements
    achievements: [
        {
            id: 'achievement-1',
            icon: 'trophy',
            title: 'All-State Selection',
            description: '1st Team WR (2023)',
            color: 'gold',
        },
        {
            id: 'achievement-2',
            icon: 'medal',
            title: 'District MVP',
            description: 'Unanimous Choice',
            color: 'blue',
        },
        {
            id: 'achievement-3',
            icon: 'star',
            title: 'Team Captain',
            description: 'Voted by Players',
            color: 'yellow',
        },
        {
            id: 'achievement-4',
            icon: 'lightning',
            title: 'School Record',
            description: '40-Yard Dash (4.45s)',
            color: 'blue',
        },
        {
            id: 'achievement-5',
            icon: 'target',
            title: '1,250 Receiving Yards',
            description: 'Junior Season',
            color: 'orange',
        },
        {
            id: 'achievement-6',
            icon: 'award',
            title: 'Offensive Player of Year',
            description: 'Austin Gazette',
            color: 'blue',
        },
    ],

    // Contact & Recruiting
    contact: {
        email: 'marcus.j.football@example.com',
        phone: '(512) 555-0123',
        socialMedia: {
            twitter: 'https://twitter.com/marcusj_wr',
            instagram: 'https://instagram.com/marcusj_wr',
            hudl: 'https://hudl.com/profile/marcusjohnson',
        },
        headCoach: {
            name: 'Coach David Miller',
            email: 'coach.miller@westlake.edu',
            phone: '(512) 555-0456',
        },
    },

    // Stats
    stats: {
        receivingYards: 1250,
        touchdowns: 12,
        receptions: 68,
        yardsPerCatch: 18.4,
        longestReception: 78,
    },

    // Profile Image
    profileImage: '/images/player-profile.jpg',

    // Recruitment Status
    recruitmentStatus: 'open',
    commitmentStatus: null,
};

export type MockPlayerData = typeof mockPlayerData;
