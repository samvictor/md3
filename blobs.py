from sklearn.datasets.samples_generator import make_blobs
import csv, sys

X, y = make_blobs(n_samples=370, centers=4, n_features=7, random_state=0, cluster_std=1.0)

coords = X.tolist()
labels = y.tolist()

data = [[]]
data[0] = ["md3_id", "label"]
for i in range (0, len(coords[0])):
	data[0].append("d_"+str(i))

for i, row in enumerate(coords):
	data.append(["row_"+str(i), labels[i]] + row)
	
with open('blobs.csv', 'wb') as fixed_file:
    fixed_writer = csv.writer(fixed_file, delimiter=',')
    
    for r in data:
        fixed_writer.writerow(r)

