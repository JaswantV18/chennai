const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const typeOld = 'const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([';
const typeNew = 'const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; sources?: {uri: string, title: string}[] }>>([';

content = content.replace(typeOld, typeNew);

const handleSendMessageCodeOld = `      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.text }]);
      } else {`;
const handleSendMessageCodeNew = `      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.text, sources: data.sources }]);
      } else {`;

content = content.replace(handleSendMessageCodeOld, handleSendMessageCodeNew);

const uiCodeOld = `                      {msg.text}
                    </div>`;
const uiCodeNew = `                      <Markdown>{msg.text}</Markdown>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#2D2D35]/50 flex flex-col gap-1">
                          <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Sources:</span>
                          {msg.sources.map((s, idx) => (
                            <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline truncate">
                              {s.title || s.uri}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>`;

content = content.replace(uiCodeOld, uiCodeNew);

fs.writeFileSync('src/App.tsx', content);
