export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category?: string;
  tags?: string[];
}

export const noteTemplates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    description: "Start with a blank canvas",
    content: "",
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Capture meeting discussions and action items",
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:**

## Agenda


## Discussion


## Action Items
- [ ]

## Next Steps
`,
    category: "Meeting",
    tags: ["meeting"],
  },
  {
    id: "idea",
    name: "Idea",
    description: "Capture a new idea or inspiration",
    content: `# Idea

## Core Concept


## Why This Matters


## Next Steps
- [ ]

## Related Thoughts
`,
    category: "Idea",
    tags: ["idea", "brainstorming"],
  },
  {
    id: "task",
    name: "Task List",
    description: "Create a to-do list or project tasks",
    content: `# Tasks

**Project:**
**Due Date:**

## To Do
- [ ]
- [ ]
- [ ]

## In Progress


## Completed

`,
    category: "Task",
    tags: ["task", "todo"],
  },
  {
    id: "research",
    name: "Research Notes",
    description: "Document research findings and sources",
    content: `# Research Notes

**Topic:**
**Date:** ${new Date().toLocaleDateString()}

## Key Findings


## Sources
-

## Questions to Explore


## Summary

`,
    category: "Research",
    tags: ["research", "study"],
  },
  {
    id: "journal",
    name: "Journal Entry",
    description: "Daily reflection or personal thoughts",
    content: `# Journal Entry

**Date:** ${new Date().toLocaleDateString()}

## Today's Highlights


## Reflections


## Gratitude

`,
    category: "Personal",
    tags: ["journal", "reflection"],
  },
  {
    id: "code-snippet",
    name: "Code Snippet",
    description: "Save a code snippet with notes",
    content: `# Code Snippet

**Language:**
**Purpose:**

## Code
\`\`\`

\`\`\`

## Usage


## Notes

`,
    category: "Development",
    tags: ["code", "programming"],
  },
];
