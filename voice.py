import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# Load your dataset
data = [
    {"text": "What's the weather like?", "intent": "get_weather"},
    {"text": "Tell me a joke", "intent": "tell_joke"},
    {"text": "Set a reminder for 5 PM", "intent": "set_reminder"},
    # Add more examples...
]
df = pd.DataFrame(data)

# Split the data
X = df['text']
y = df['intent']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create a pipeline
model = make_pipeline(CountVectorizer(), MultinomialNB())

# Train the model
model.fit(X_train, y_train)

# Evaluate the model
accuracy = model.score(X_test, y_test)
print(f'Model accuracy: {accuracy:.2f}')
