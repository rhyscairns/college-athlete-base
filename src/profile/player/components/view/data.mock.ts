// data/mock.ts
export type SocialLink = {
    label: string;
    href: string;
    kind: "twitter" | "instagram" | "hudl";
};

export type AthleteHero = {
    brand: { short: string };
    nav: { label: string; href: string }[];
    cta: { label: string; href: string };
    badge: string;
    name: { first: string; last: string };
    subtitle: { position: string; school: string };
    stats: { label: string; value: string; sub?: string }[];
    chips: string[];
    portrait: { alt: string; src?: string }; // src optional - you can plug in later
};

export type HighlightVideo = {
    id: string;
    title: string;
    subtitle: string;
    featured?: boolean;
    duration: string;
    thumbnailSrc?: string;
};

export type GameHighlights = {
    title: string;
    featured: HighlightVideo;
    moreTitle: string;
    more: HighlightVideo[];
    cta: { label: string; href: string };
};

export type Achievement = {
    id: string;
    title: string;
    subtitle: string;
    kind: "trophy" | "medal" | "star" | "bolt" | "target" | "award";
};

export type AthleticAchievements = {
    title: string;
    subtitle: string;
    items: Achievement[];
};

export type AcademicMetricCard =
    | {
        kind: "gpa";
        label: string;
        value: string;
        sub: string;
    }
    | {
        kind: "sat";
        label: string;
        value: string;
        sub: string;
    }
    | {
        kind: "rank";
        label: string;
        value: string;
        sub: string;
    }
    | {
        kind: "coursework";
        label: string;
        items: string[];
    };

export type AcademicProfile = {
    title: string;
    eligibilityId: string;
    qualifierLabel: string;
    metrics: AcademicMetricCard[];
};

export type CoachQuote = {
    id: string;
    quote: string;
    name: string;
    role: string;
    org: string;
};

export type CoachesPerspective = {
    title: string;
    quotes: CoachQuote[];
};

export type RecruitingContact = {
    left: {
        title: string;
        body: string;
        email: string;
        phone: string;
        socials: SocialLink[];
    };
    right: {
        title: string;
        body: string;
        primaryCta: { label: string; href: string };
        secondaryCta: { label: string; href: string };
        coachLabel: string;
        coachName: string;
        coachEmail: string;
    };
};

export const mockHero: AthleteHero = {
    brand: { short: "MJ." },
    nav: [
        { label: "Highlights", href: "#highlights" },
        { label: "Stats", href: "#stats" },
        { label: "Academics", href: "#academics" },
    ],
    cta: { label: "Recruit Me", href: "#recruit" },
    badge: "CLASS OF 2025",
    name: { first: "MARCUS", last: "JOHNSON" },
    subtitle: { position: "Wide Receiver", school: "Westlake High School" },
    stats: [
        { label: "HEIGHT", value: `6'2"` },
        { label: "WEIGHT", value: "185", sub: "lbs" },
        { label: "AGE", value: "17" },
        { label: "LOCATION", value: "Austin, TX" },
    ],
    chips: ["4.45s 40-Yard Dash", `36" Vertical`, "245lb Bench"],
    portrait: {
        alt: "Marcus Johnson Athlete Portrait",
        // src: "/images/portrait.jpg"
    },
};

export const mockHighlights: GameHighlights = {
    title: "GAME HIGHLIGHTS",
    featured: {
        id: "feat",
        featured: true,
        title: "Junior Season Official Highlights (2023–24)",
        subtitle: "Full season compilation • 12 TDs • 1,200+ Yards",
        duration: "7:32",
        // thumbnailSrc: "/images/highlight-hero.jpg"
    },
    moreTitle: "More Clips",
    more: [
        {
            id: "1",
            title: "Season Opener vs. North High",
            subtitle: "Sept 2023",
            duration: "3:45",
            // thumbnailSrc: "/images/clip-1.jpg"
        },
        {
            id: "2",
            title: "Playoff Quarterfinals Highlights",
            subtitle: "Nov 2023",
            duration: "2:15",
            // thumbnailSrc: "/images/clip-2.jpg"
        },
        {
            id: "3",
            title: "7-on-7 Summer Circuit",
            subtitle: "July 2023",
            duration: "4:20",
            // thumbnailSrc: "/images/clip-3.jpg"
        },
    ],
    cta: { label: "View All 12 Videos on Hudl", href: "#" },
};

export const mockAchievements: AthleticAchievements = {
    title: "ATHLETIC ACHIEVEMENTS",
    subtitle: "Consistent performance at the highest level of high school competition.",
    items: [
        { id: "a1", title: "All-State Selection", subtitle: "1st Team WR (2023)", kind: "trophy" },
        { id: "a2", title: "District MVP", subtitle: "Unanimous Choice", kind: "medal" },
        { id: "a3", title: "Team Captain", subtitle: "Voted by Players", kind: "star" },
        { id: "a4", title: "School Record", subtitle: "40-Yard Dash (4.45s)", kind: "bolt" },
        { id: "a5", title: "1,250 Receiving Yards", subtitle: "Junior Season", kind: "target" },
        { id: "a6", title: "Offensive Player of Year", subtitle: "Austin Gazette", kind: "award" },
    ],
};

export const mockAcademics: AcademicProfile = {
    title: "ACADEMIC PROFILE",
    eligibilityId: "NCAA Eligibility Center ID: #2345678901",
    qualifierLabel: "NCAA Qualifier",
    metrics: [
        { kind: "gpa", label: "GPA (WEIGHTED)", value: "3.8", sub: "4.0 Scale" },
        { kind: "sat", label: "SAT SCORE", value: "1350", sub: "Math: 680 | Reading: 670" },
        { kind: "rank", label: "CLASS RANK", value: "Top 10%", sub: "45 out of 450 Students" },
        { kind: "coursework", label: "COURSEWORK", items: ["AP Calculus AB", "AP Physics", "National Honor Society"] },
    ],
};

export const mockCoaches: CoachesPerspective = {
    title: "COACHES' PERSPECTIVE",
    quotes: [
        {
            id: "c1",
            quote:
                "Marcus is the first one on the field and the last one to leave. His work ethic sets the tone for our entire program. He's not just a playmaker; he's a leader.",
            name: "Coach David Miller",
            role: "Head Football Coach",
            org: "Westlake High School",
        },
        {
            id: "c2",
            quote:
                "Rare combination of speed, size, and football IQ. He understands coverages better than most college freshmen I've seen. An absolute steal for any program.",
            name: "James Wilson",
            role: "Offensive Coordinator",
            org: "Westlake High School",
        },
        {
            id: "c3",
            quote:
                "A fierce competitor who elevates everyone around him. In clutch moments, you want the ball in his hands. He thrives under pressure.",
            name: "Sarah Thomas",
            role: "Athletic Director",
            org: "Westlake Athletics",
        },
    ],
};

export const mockRecruiting: RecruitingContact = {
    left: {
        title: "Recruiting Contact",
        body: "Interested in discussing how I can contribute to your program? Please reach out directly or contact my head coach.",
        email: "marcus.j.football@example.com",
        phone: "(512) 555-0123",
        socials: [
            { label: "Twitter", href: "#", kind: "twitter" },
            { label: "Instagram", href: "#", kind: "instagram" },
            { label: "HUDL", href: "#", kind: "hudl" },
        ],
    },
    right: {
        title: "Recruiting Packet",
        body: "Download my full athletic profile, transcripts, and schedule.",
        primaryCta: { label: "Download Athletic Resume (PDF)", href: "#" },
        secondaryCta: { label: "View Full Hudl Profile", href: "#" },
        coachLabel: "Coach Contact",
        coachName: "Coach David Miller",
        coachEmail: "coach.miller@westlake.edu",
    },
};
