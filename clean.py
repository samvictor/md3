# Cleans raw data and makes it appropriate for other parts of MD3
# This includes adding unique ids like "row_1" to every row, 
# and expanding variables with letters into other dimensions with 1 or 0
# as the values


import csv, sys

# Get raw data
datafile = "cars.csv"

# set to True if first column entries are labels
has_labels = False

if len(sys.argv) > 1:
    datafile = sys.argv[1]
    if len(sys.argv) > 2:
        if sys.argv == "has_labels":
            has_labels = True


row_begin = 0
if has_labels:
    row_begin = 1
    
data = []
to_expand = []
with open(datafile, 'rb') as csvfile:
    data_read = csv.reader(csvfile, delimiter=',')
    for j, row in enumerate(data_read):
        for i in range(row_begin, len(row)):
            try:
                row[i] = float(row[i])
            except:
                if j: # if j != 0, which is where the labels are
                    row[i] = temp_cell = row[i].strip()
                    if temp_cell == '':
                        row[i] = 0
                        print "Warning: blank entry found, 0 used instead"
                    else:
                        if not i in to_expand:
                            to_expand.append(i)
                    
        data.append(row)

        
# expand string data into different dimensions
for i in to_expand:
    unique_strings = []
    for j, row in enumerate(data):
        if j == 0:
            continue
        
        if row[i] not in unique_strings:
            unique_strings.append(row[i])
        
    for j, row in enumerate(data):
        if j == 0:
            continue
            
        build_row = []
        for s in unique_strings:
            if row[i] == s:
                build_row.append(1)
            else:
                build_row.append(0)
        
        row += build_row
    unique_strings = map(lambda s: s+"_col_"+str(i), unique_strings)
    data[0] += unique_strings

to_expand.sort(reverse = True)

# remove originals with strings from data
for row in data:
    for j in to_expand:
        del row[j]

# add "row_{row num}" and key "md3_id"
data[0] = ["md3_id"] + data[0]
for i in range(1, len(data)):
    data[i] = ["row_"+str(i)] + data[i]


for row in data:
    print row
    
# file name should only have one dot
with open(datafile.split('.')[0]+'_clean.'+datafile.split('.')[1], 'wb') as fixed_file:
    fixed_writer = csv.writer(fixed_file, delimiter=',')
    for r in data:
        fixed_writer.writerow(r)
