from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re
import random

# ---------------- MODEL ----------------
MODEL_PATH = r"C:\Users\kship\PycharmProjects\Mindmend\model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

device = torch.device("cpu")
model.to(device)
model.eval()

# ---------------- MEMORY ----------------
conversation_memory = {}

# ---------------- EMOTION DETECTION ----------------
def detect_emotion(text):
    text = text.lower()

    if any(w in text for w in ["suicide", "kill myself", "end life", "want to die", "die"]):
        return "suicidal"
    elif any(w in text for w in ["anxious", "panic", "nervous", "worried", "scared", "fear"]):
        return "anxious"
    elif any(w in text for w in ["sad", "cry", "empty", "hurt", "low", "depressed", "upset"]):
        return "sad"
    elif any(w in text for w in ["angry", "irritated", "frustrated", "mad"]):
        return "angry"
    elif any(w in text for w in ["lonely", "alone", "isolated", "no one"]):
        return "lonely"

    return "neutral"


# ---------------- CLEAN OUTPUT ----------------
def clean_text(text):
    text = text.strip()

    # Remove unwanted role markers if model generates them
    text = re.sub(r"(<\|user\|>|<\|assistant\|>|User:|Assistant:|Human:|Bot:)", "", text)
    text = text.strip()

    # Stop if model starts generating another turn
    stop_markers = [
        "\nUser:",
        "\nAssistant:",
        "\nHuman:",
        "\nBot:",
        "<|user|>",
        "<|assistant|>"
    ]

    for marker in stop_markers:
        if marker in text:
            text = text.split(marker)[0].strip()

    # Remove repeated spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ---------------- SAFETY CHECK ----------------
def is_safe_reply(reply):
    reply_lower = reply.lower()

    unsafe_patterns = [
        "come over",
        "meet me",
        "let's meet",
        "i'll come",
        "where do you live",
        "send me",
        "call me",
        "text me",
        "visit me",
        "i love you",
        "kiss",
        "date",
        "be with me",
        "relationship with you"
    ]

    return not any(pattern in reply_lower for pattern in unsafe_patterns)


# ---------------- LOW QUALITY FILTER ----------------
def is_low_quality(reply):
    reply_lower = reply.lower().strip()

    bad_patterns = [
        "hello",
        "hi",
        "okay",
        "yes",
        "no",
        "hmm",
        "alright",
        "i don't know",
        "i am fine"
    ]

    if len(reply_lower.split()) < 5:
        return True

    if reply_lower in bad_patterns:
        return True

    return False


# ---------------- FALLBACK RESPONSES ----------------
def fallback_reply(emotion, message=""):
    message = message.lower()

    if "exam" in message and "breakup" in message:
        return "That sounds really heavy, managing exam stress while going through a breakup. That's a lot at once. What feels harder right now, the exams or the breakup?"

    responses = {
        "anxious": [
            "That sounds really uncomfortable. I'm here with you. What do you think is making you feel anxious right now?",
            "Anxiety can feel overwhelming. Let's take it slowly. What is the biggest worry on your mind?",
            "It's okay to feel this way. You don't have to handle it all at once. What happened?"
        ],
        "sad": [
            "I'm really sorry you're feeling like this. You don't have to go through it alone. Do you want to tell me what happened?",
            "That sounds painful. I'm here to listen. What's been weighing on you?",
            "It's okay to feel low sometimes. What has been hurting you the most?"
        ],
        "lonely": [
            "Feeling alone can be really hard. I'm here with you. What has been making you feel this way?",
            "I'm really glad you reached out. Do you want to talk about what's been making you feel lonely?",
            "You don't have to sit with that feeling alone right now. Tell me what's going on."
        ],
        "angry": [
            "That sounds frustrating. What happened?",
            "I hear you. That kind of feeling can build up a lot. What triggered it?",
            "It makes sense that you'd feel upset. Do you want to tell me what caused it?"
        ],
        "suicidal": [
            "I'm really sorry you're feeling this way. You matter, and you deserve support right now. Please reach out to someone you trust or a local emergency helpline if you might hurt yourself.",
            "This sounds really serious. You don't have to go through it alone. If you're in immediate danger, please contact emergency services or someone near you right now.",
            "I'm here with you, but this is important to share with a real person too. Can you contact someone you trust right now?"
        ],
        "neutral": [
            "I'm here with you. Tell me what's on your mind.",
            "You can share anything here. What's been going on?",
            "I'm listening. Take your time."
        ]
    }

    return random.choice(responses.get(emotion, responses["neutral"]))


# ---------------- PROMPT BUILDER ----------------
def build_prompt(user_id):
    history = conversation_memory[user_id]

    system_instruction = (
        "You are Mindmend, a calm and supportive mental health chatbot. "
        "Reply according to the user's latest message. "
        "Be warm, short, safe, and conversational. "
        "Do not be romantic, sexual, rude, or unsafe. "
        "Ask one gentle follow-up question when useful."
    )

    prompt = system_instruction + "\n\n"

    for turn in history:
        if turn["role"] == "user":
            prompt += f"User: {turn['content']}\n"
        elif turn["role"] == "assistant":
            prompt += f"Assistant: {turn['content']}\n"

    prompt += "Assistant:"

    return prompt


# ---------------- MAIN CHAT FUNCTION ----------------
def get_ai_reply(message, emotion=None, risk_level="low", user_id="default_user"):
    try:
        if emotion is None:
            emotion = detect_emotion(message)

        if user_id not in conversation_memory:
            conversation_memory[user_id] = []

        # Save user message
        conversation_memory[user_id].append({
            "role": "user",
            "content": message
        })

        # Keep only recent conversation
        conversation_memory[user_id] = conversation_memory[user_id][-8:]

        # Direct safety fallback for suicidal messages
        if emotion == "suicidal":
            reply = fallback_reply(emotion, message)
            conversation_memory[user_id].append({
                "role": "assistant",
                "content": reply
            })
            return reply

        prompt = build_prompt(user_id)

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=900
        ).to(device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=90,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.15,
                do_sample=True,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode only newly generated text
        input_length = inputs["input_ids"].shape[1]
        reply_ids = outputs[0][input_length:]
        reply = tokenizer.decode(reply_ids, skip_special_tokens=True)

        reply = clean_text(reply)

        banned_words = ["fuck", "shit", "stupid"]

        bad_positive = [
            "glad to hear",
            "that's great",
            "awesome",
            "nice",
            "good to hear"
        ]

        # Avoid wrong happy replies when user is sad/anxious/lonely
        if emotion in ["anxious", "sad", "lonely"]:
            if any(p in reply.lower() for p in bad_positive):
                reply = fallback_reply(emotion, message)

        # Final quality and safety filter
        if (
            len(reply) < 5 or
            any(b in reply.lower() for b in banned_words) or
            not is_safe_reply(reply) or
            is_low_quality(reply)
        ):
            reply = fallback_reply(emotion, message)

        # Save assistant reply
        conversation_memory[user_id].append({
            "role": "assistant",
            "content": reply
        })

        return reply

    except Exception as e:
        print("CHATBOT ERROR:", e)
        return fallback_reply(emotion or "neutral", message)


# ---------------- OPTIONAL: CLEAR MEMORY ----------------
def clear_memory(user_id="default_user"):
    if user_id in conversation_memory:
        conversation_memory[user_id] = []


# ---------------- TEST CHAT ----------------
if __name__ == "__main__":
    print("Mindmend chatbot started. Type 'exit' to stop.\n")

    while True:
        user_message = input("You: ")

        if user_message.lower().strip() in ["exit", "quit", "bye"]:
            print("Mindmend: Take care. I'm glad you talked today.")
            break

        emotion = detect_emotion(user_message)
        reply = get_ai_reply(user_message, emotion, risk_level="low")

        print("Mindmend:", reply)