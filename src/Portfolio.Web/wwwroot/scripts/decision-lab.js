import { decisions, newDecisionSession, chooseDecision, advanceDecision } from './decision-data.js';

export function initDecisionLab() {
  const root = document.querySelector('#decision-lab');
  if (!root) return;
  const board = root.querySelector('[data-decision-board]');
  const start = root.querySelector('[data-decision-start]');
  let state = newDecisionSession();
  let started = false;
  const lang = () => document.documentElement.lang === 'tr' ? 'tr' : 'en';
  const t = (en, tr) => lang() === 'tr' ? tr : en;
  const local = value => value[lang()];
  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }
  function focus(target) {
    const node = board.querySelector(target);
    node?.focus({ preventScroll: true });
    if (target === '[data-decision-question]') board.scrollIntoView({ behavior: 'instant', block: 'start' });
    else if (target === '[data-feedback-title]' && matchMedia('(max-width: 800px)').matches) board.querySelector('.decision-outcome').scrollIntoView({ behavior: 'instant', block: 'start' });
    else node?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }
  function flow(labels, resolved) {
    const list = element('ol', `decision-flow${resolved ? ' is-resolved' : ''}`);
    list.setAttribute('aria-label', t('Illustrative sequence', 'Örnek akış'));
    labels.forEach((label, index) => {
      const step = element('li');
      const number = element('span', 'decision-flow-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      step.append(number, element('span', '', local(label)));
      list.append(step);
    });
    return list;
  }
  function render() {
    start.querySelector('span').textContent = !started ? t('Take the controls', 'Kontrolü devral') : state.complete ? t('Play again', 'Yeniden oyna') : t('Start over', 'Baştan başla');
    board.hidden = !started;
    if (!started) return;
    const progress = element('ol', 'decision-progress');
    progress.setAttribute('aria-label', t('Decision journey', 'Karar adımları'));
    decisions.forEach((round, index) => {
      const step = element('li', state.complete || index < state.index ? 'is-done' : '', `${index + 1} / ${local(round.label)}`);
      if (!state.complete && index === state.index) step.setAttribute('aria-current', 'step');
      progress.append(step);
    });
    board.replaceChildren(progress);
    if (state.complete) {
      const summary = element('div', 'decision-summary');
      const title = element('h3', '', t('Three calls. One connected system.', 'Üç karar. Birbirine bağlı bir sistem.'));
      title.tabIndex = -1;
      title.dataset.decisionQuestion = '';
      summary.append(title, element('p', '', t('You followed the consequences. Here is the path you chose; replay to explore the alternatives.', 'Kararlarının sonuçlarını takip ettin. Seçtiğin yol aşağıda; alternatifleri keşfetmek için yeniden oynayabilirsin.')));
      const list = element('ol', 'decision-recap');
      decisions.forEach((round, index) => {
        const choice = round.choices.find(item => item.id === state.answers[index]);
        const item = element('li');
        item.append(element('span', 'decision-recap-domain', local(round.label)), element('h4', '', local(choice.title)), element('p', '', local(choice.label)));
        list.append(item);
      });
      summary.append(list);
      const actions = element('div', 'decision-actions');
      const replay = element('button', 'button primary', t('Try a different route', 'Başka bir yol dene'));
      replay.type = 'button'; replay.dataset.decisionAction = 'restart';
      const work = element('a', 'text-link', t('See my engineering work', 'Yaptığım çalışmaları incele'));
      work.href = '#work';
      actions.append(replay, work);
      summary.append(actions);
      board.append(summary);
      return;
    }
    const round = decisions[state.index];
    const selected = round.choices.find(choice => choice.id === state.answers[state.index]);
    const layout = element('div', 'decision-layout');
    const prompt = element('div', 'decision-prompt');
    const title = element('h3', '', local(round.title));
    title.tabIndex = -1; title.dataset.decisionQuestion = '';
    prompt.append(title, element('p', 'decision-situation', local(round.situation)));
    const options = element('fieldset', 'decision-options');
    options.append(element('legend', '', local(round.question)));
    round.choices.forEach((choice, index) => {
      const button = element('button', 'decision-choice');
      button.type = 'button'; button.dataset.decisionChoice = choice.id;
      button.setAttribute('aria-pressed', String(selected?.id === choice.id));
      const letter = element('span', 'decision-letter', String.fromCharCode(65 + index));
      letter.setAttribute('aria-hidden', 'true');
      button.append(letter, element('span', '', local(choice.label)));
      options.append(button);
    });
    prompt.append(options);
    const outcome = element('div', 'decision-outcome');
    outcome.append(element('p', 'decision-signal', local(round.signal)), flow(selected ? selected.after : round.before, !!selected));
    if (selected) {
      const title = element('h4', 'decision-result-title', local(selected.title));
      title.tabIndex = -1; title.dataset.feedbackTitle = '';
      title.setAttribute('aria-describedby', 'decision-explanation');
      const explanation = element('p', 'decision-explanation', local(selected.explanation));
      explanation.id = 'decision-explanation';
      outcome.append(title, explanation);
      const actions = element('div', 'decision-actions');
      const next = element('button', 'button primary', state.index === decisions.length - 1 ? t('See your decisions', 'Kararlarını gör') : t('Next decision', 'Sıradaki karar'));
      next.type = 'button'; next.dataset.decisionAction = 'next';
      const again = element('button', 'decision-retry', t('Explore another choice', 'Başka seçeneği dene'));
      again.type = 'button'; again.dataset.decisionAction = 'explore';
      actions.append(next, again);
      outcome.append(actions);
    } else {
      outcome.append(element('p', 'decision-awaiting', t('Your move. Choose an approach to see how the system responds.', 'Sıra sende. Bir yaklaşım seç; sistemin nasıl karşılık verdiğini gör.')));
    }
    layout.append(prompt, outcome);
    board.append(layout);
  }
  function restart() { started = true; state = newDecisionSession(); render(); focus('[data-decision-question]'); }
  start.addEventListener('click', restart);
  board.addEventListener('click', event => {
    const choice = event.target.closest('[data-decision-choice]');
    if (choice) {
      state = chooseDecision(state, choice.dataset.decisionChoice);
      render(); focus('[data-feedback-title]');
      return;
    }
    const action = event.target.closest('[data-decision-action]')?.dataset.decisionAction;
    if (action === 'next') { state = advanceDecision(state); render(); focus('[data-decision-question]'); }
    if (action === 'restart') restart();
    if (action === 'explore') focus('[data-decision-choice]');
  });
  document.addEventListener('portfolio:language', render);
  render();
}
