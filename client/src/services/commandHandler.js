import { api } from './api';

export const SUPPORTED_COMMANDS = [
  'Add a project called [Title]',
  'How many views do I have?',
  'What\'s my profile completeness?',
  'Open my public portfolio',
  'Go to skills',
  'Preview phone',
  'Show my recent portfolio activity',
  'Show my GitHub repositories'
];

/**
 * Text-to-Speech Output Helper
 */
export function speakText(text, isMuted = false, onEnd = null) {
  if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#`]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Unified Command Engine (Powers BOTH typed commands and spoken recognition)
 * Every command that reads data calls authenticated API endpoints scoped to the logged-in user.
 */
export async function processVoiceCommand(rawInput, { navigate, profile }) {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      responseText: 'Please say or type a command.',
      actionDescription: 'No input provided'
    };
  }

  // Normalize: lower case, strip basic punctuation, clean spaces
  const cleanInput = rawInput
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .trim();

  // 1. "Add a project called [Title]"
  // Match: "add a project called Logo Design", "create project named Mobile App", "add project Portfolio"
  const addProjectMatch = cleanInput.match(/^(?:add|create)\s+(?:a\s+)?project\s*(?:called|named)?\s*(.*)$/i);
  if (addProjectMatch) {
    const rawTitle = addProjectMatch[1]?.trim();
    const title = rawTitle && rawTitle.length > 0
      ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)
      : 'New Project';

    // Navigate to projects with query parameters to open modal with pre-filled title (WITHOUT saving yet)
    navigate(`/dashboard/projects?action=new&title=${encodeURIComponent(title)}`);

    return {
      commandId: 'ADD_PROJECT',
      success: true,
      responseText: `Opening new project form with title "${title}". Click Save when you are ready to create it.`,
      actionDescription: `Opened project creation modal with title "${title}"`
    };
  }

  // 2. "How many views do I have?"
  if (
    cleanInput.includes('how many views') ||
    cleanInput.includes('my views') ||
    cleanInput.includes('total views') ||
    cleanInput.includes('show views')
  ) {
    try {
      const data = await api.getAnalytics('all');
      const total = data.total_views || 0;
      const today = data.views_today || 0;

      return {
        commandId: 'GET_VIEWS',
        success: true,
        responseText: `You have ${total} total ${total === 1 ? 'view' : 'views'} on your public portfolio, with ${today} ${today === 1 ? 'view' : 'views'} recorded today.`,
        actionDescription: `Retrieved view metrics: ${total} total (${today} today)`
      };
    } catch (err) {
      return {
        commandId: 'GET_VIEWS',
        success: false,
        responseText: 'Unable to retrieve your portfolio analytics at this moment.',
        actionDescription: 'Failed to fetch views'
      };
    }
  }

  // 3. "What's my profile completeness?"
  if (
    cleanInput.includes('profile completeness') ||
    cleanInput.includes('profile score') ||
    cleanInput.includes('completeness')
  ) {
    try {
      const res = await api.getProfile();
      const pct = res.completeness?.percentage || 0;
      const missing = res.completeness?.checklist?.filter(item => !item.done) || [];

      let missingAdvice = '';
      if (missing.length > 0) {
        missingAdvice = ` Next recommended step: ${missing[0].label}.`;
      } else {
        missingAdvice = ' Congratulations, your profile is 100% complete!';
      }

      return {
        commandId: 'GET_COMPLETENESS',
        success: true,
        responseText: `Your portfolio profile is ${pct}% complete.${missingAdvice}`,
        actionDescription: `Profile completeness: ${pct}%`
      };
    } catch (err) {
      return {
        commandId: 'GET_COMPLETENESS',
        success: false,
        responseText: 'Unable to calculate profile completeness right now.',
        actionDescription: 'Failed to fetch profile'
      };
    }
  }

  // 4. "Open my public portfolio"
  if (
    cleanInput.includes('open my public portfolio') ||
    cleanInput.includes('open public portfolio') ||
    cleanInput.includes('view my portfolio') ||
    cleanInput.includes('show public portfolio')
  ) {
    const slug = profile?.username || 'user';
    const publicUrl = `/u/${slug}`;
    if (typeof window !== 'undefined') {
      window.open(publicUrl, '_blank');
    }

    return {
      commandId: 'OPEN_PUBLIC_PORTFOLIO',
      success: true,
      responseText: `Opening your public portfolio in a new tab for @${slug}.`,
      actionDescription: `Opened public portfolio ${publicUrl}`
    };
  }

  // 5. "Go to skills"
  if (
    cleanInput.includes('go to skills') ||
    cleanInput.includes('open skills') ||
    cleanInput.includes('show skills') ||
    cleanInput === 'skills'
  ) {
    navigate('/dashboard/skills');
    return {
      commandId: 'NAV_SKILLS',
      success: true,
      responseText: 'Navigating to your skills and expertise page.',
      actionDescription: 'Navigated to /dashboard/skills'
    };
  }

  // 6. "Preview phone"
  if (
    cleanInput.includes('preview phone') ||
    cleanInput.includes('phone preview') ||
    cleanInput.includes('mobile preview')
  ) {
    // Navigates to the analytics page where the interactive device preview is housed, selecting 'phone' mode
    navigate('/dashboard/analytics?device=phone');
    return {
      commandId: 'PREVIEW_PHONE',
      success: true,
      responseText: 'Navigating to the Device Preview on your Analytics page and selecting phone mode.',
      actionDescription: 'Selected phone mode on /dashboard/analytics'
    };
  }

  // 7. "Show my recent portfolio activity"
  if (
    cleanInput.includes('recent portfolio activity') ||
    cleanInput.includes('recent activity') ||
    cleanInput.includes('portfolio activity')
  ) {
    try {
      const act = await api.getRecentActivity();
      return {
        commandId: 'GET_ACTIVITY',
        success: true,
        responseText: `Recent activity: ${act.summary}`,
        actionDescription: act.summary
      };
    } catch (err) {
      return {
        commandId: 'GET_ACTIVITY',
        success: false,
        responseText: 'Unable to fetch recent portfolio activity right now.',
        actionDescription: 'Failed to fetch activity'
      };
    }
  }

  // 8. "Show my GitHub repositories"
  if (
    cleanInput.includes('github repos') ||
    cleanInput.includes('github repositories') ||
    cleanInput.includes('show github')
  ) {
    navigate('/dashboard/integrations');
    return {
      commandId: 'NAV_GITHUB',
      success: true,
      responseText: 'Opening your GitHub integrations. Enter your GitHub username there and click Fetch Repos.',
      actionDescription: 'Navigated to /dashboard/integrations'
    };
  }

  // Fallback for unrecognised commands: lists the 8 supported commands
  return {
    commandId: 'UNKNOWN',
    success: false,
    responseText: `I didn't recognize that command. Here are the commands you can use:\n• "Add a project called [Title]"\n• "How many views do I have?"\n• "What's my profile completeness?"\n• "Open my public portfolio"\n• "Go to skills"\n• "Preview phone"\n• "Show my recent portfolio activity"\n• "Show my GitHub repositories"`,
    actionDescription: 'Unrecognized command'
  };
}

